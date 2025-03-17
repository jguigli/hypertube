from typing import Annotated
from fastapi import Depends, Response, HTTPException, APIRouter, status, Request
from sqlalchemy.orm import Session
from pydantic import BaseModel
import json
from typing import List
from datetime import datetime
from fastapi.responses import StreamingResponse, FileResponse

from api.redis_client import redis_client
from api.database import get_db
from api.users import models as user_models
from api.login import security
from .fetch import (
    fetch_popular_movies_tmdb,
    search_movies_tmdb,
    get_magnet_link_piratebay,
    fetch_genres_movies_tmdb,
    fetch_movie_detail_tmdb
)
from .crud import (
    mark_movie_as_watched,
    get_watched_movie,
    get_watched_movies,
    get_watched_movies_id,
    get_movie_by_id,
    create_movie,
    map_to_movie_display,
    map_to_movie_info
)

from . import schemas, models
from .download import download_torrent, file_streamer
import os
import asyncio
import time
from .hls import convert_to_hls, HLS_MOVIES_FOLDER

router = APIRouter(tags=["Movies"])


@router.get('/movies/search', response_model=List[schemas.MovieDisplay])
async def search_movies(
    search: str,
    language: str,
    page: int,
    current_user: Annotated[user_models.User, Depends(security.get_current_user_authentified_or_anonymous)
    ],
    db: Session = Depends(get_db)
):
    cached_searches = redis_client.get(f"search:{search}:{language}:{page}")
    if cached_searches:
        movies_data = json.loads(cached_searches)
    else:
        movies_data = search_movies_tmdb(search, language, page)
        if not movies_data:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Search movie not available")
        
    cached_genres = redis_client.get(f"genres_movies:{language}")
    if cached_genres:
        genres = json.loads(cached_genres)
    else:
        genres = fetch_genres_movies_tmdb(language)
        if not genres:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Genres for movies not available")

    if current_user:
        watched_movies = get_watched_movies_id(db, current_user.id)

        for movie in movies_data:
            movie["is_watched"] = movie["id"] in watched_movies

    movies = [map_to_movie_display(movie, genres) for movie in movies_data]
    if not movies:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Search movie not available")
    
    return movies


@router.get('/movies/popular/{page}', response_model=List[schemas.MovieDisplay])
async def get_popular_movies(
    page: int,
    language: str,
    current_user: Annotated[user_models.User, Depends(security.get_current_user_authentified_or_anonymous)],
    db: Session = Depends(get_db)
):
    cached_movies = redis_client.get(f"popular_movies:{page}:{language}")
    if cached_movies:
        movies_data = json.loads(cached_movies)
    else:
        movies_data = fetch_popular_movies_tmdb(language, page)
        if not movies_data:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Popular movies not available")
        
    cached_genres = redis_client.get(f"genres_movies:{language}")
    if cached_genres:
        genres = json.loads(cached_genres)
    else:
        genres = fetch_genres_movies_tmdb(language)
        if not genres:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Genres for movies not available")

    if current_user:
        watched_movies = get_watched_movies_id(db, current_user.id)

        for movie in movies_data:
            movie["is_watched"] = movie["id"] in watched_movies

    movies = [map_to_movie_display(movie, genres) for movie in movies_data]
    if not movies:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No movies found")

    return movies


@router.get('/movies/{movie_id}', response_model=schemas.MovieInfo)
async def get_movie_informations(
    movie_id: int,
    language: str,
    current_user: Annotated[user_models.User, Depends(security.get_current_user)],
    db: Session = Depends(get_db)
):
    cached_detailed_movie = redis_client.get(f"detailed_movie:{movie_id}:{language}")
    if cached_detailed_movie:
        detailed_movie = json.loads(cached_detailed_movie)
    else:
        detailed_movie = fetch_movie_detail_tmdb(movie_id, language)
        if not detailed_movie:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Detailed movie not available")
        
    db_movie = get_movie_by_id(db, movie_id)
    if not db_movie:
        db_movie = create_movie(db, detailed_movie['id'], detailed_movie['original_title'], detailed_movie['release_date'])

    return map_to_movie_info(detailed_movie, db_movie)


@router.get('/movies/{movie_id}/stream/{resolution}/{token}')
async def start_streaming(
    movie_id: int,
    resolution: str,
    token: str,
    db: Session = Depends(get_db)
):
    # current_user = security.get_current_user_streaming(token, db)
    movie = get_movie_by_id(db, movie_id)
    if not movie:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid movie")
    if not movie.magnet_link:
        year = datetime.strptime(movie.release_date, "%Y-%m-%d").year
        magnet_link = get_magnet_link_piratebay(movie.original_title, year)
        if not magnet_link:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Movie not available")

        movie.magnet_link = magnet_link
        db.commit()

    # watched_movie = get_watched_movie(db, current_user.id, movie_id)
    # if not watched_movie:
    #     mark_movie_as_watched(db, current_user.id, movie_id)
    # else:
    #     watched_movie.watched_at = datetime.now()
    #     db.commit()

    if not movie.file_path:
        asyncio.create_task(download_torrent(movie.magnet_link, movie.id))
        while not redis_client.get(f"movie_path:{movie_id}"):
            await asyncio.sleep(1)
        movie.file_path = redis_client.get(f"movie_path:{movie_id}")
        db.commit()

    dir_hls_path = f"{HLS_MOVIES_FOLDER}/movie_{movie_id}"
    if not os.path.isdir(dir_hls_path):
        asyncio.create_task(convert_to_hls(movie.file_path, movie.id, resolution))

    file_path = f"{dir_hls_path}/resolution_{resolution}/playlist_{resolution}.m3u8"
    while not os.path.exists(file_path):
        await asyncio.sleep(1)
    return FileResponse(file_path, media_type="application/vnd.apple.mpegurl")


@router.get('/movies/{movie_id}/stream/{resolution}/{token}/{segment}')
async def get_segment_stream(
    movie_id: int,
    resolution: str,
    token: str,
    segment: str,
    db: Session = Depends(get_db)
):
    # current_user = security.get_current_user_streaming(token, db)
    movie = get_movie_by_id(db, movie_id)
    if not movie:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid movie")

    file_path = f"{HLS_MOVIES_FOLDER}/movie_{movie_id}/resolution_{resolution}/{segment}"
    while not os.path.exists(file_path):
        await asyncio.sleep(1)
    # if not os.path.exists(file_path):
    #     raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Segment not available")
    return FileResponse(file_path, media_type="video/MP2T")