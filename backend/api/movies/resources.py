from typing import Annotated
from fastapi import Depends, Response, HTTPException, APIRouter, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
import json
from typing import List
from datetime import datetime
from fastapi.responses import StreamingResponse

from api.redis_client import redis_client
from api.database import get_db
from api.users import models as user_models
from api.login import security
from .fetch import (
    fetch_popular_movies_tmdb,
    search_movies_tmdb,
    get_magnet_link_piratebay,
)
from .crud import (
    mark_movie_as_watched,
    get_watched_movie,
    get_watched_movies,
    get_watched_movies_id,
    get_movie_by_id,
    create_movie,
    map_to_movie_display,
    map_to_movie
)

from . import schemas, models
from .download import download_torrent, file_streamer

router = APIRouter(tags=["Movies"])


@router.get('/movies/search', response_model=List[schemas.MovieDisplay])
async def search_movies(
    search: str,
    language: str,
    current_user: Annotated[user_models.User, Depends(security.get_current_user_authentified_or_anonymous)],
    db: Session = Depends(get_db)
):
    cached_searches = redis_client.get(f"search:{search}:{language}")
    if cached_searches:
        movies_data = json.loads(cached_searches)
    else:
        movies_data = search_movies_tmdb(search, language)
        if not movies_data:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Search movie not available")

    if current_user:
        watched_movies = get_watched_movies_id(db, current_user.id)

        for movie in movies_data:
            movie["is_watched"] = movie["id"] in watched_movies

    movies = [map_to_movie_display(movie) for movie in movies_data]
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
    
    if current_user:
        watched_movies = get_watched_movies_id(db, current_user.id)

        for movie in movies_data:
            movie["is_watched"] = movie["id"] in watched_movies

    movies = [map_to_movie_display(movie) for movie in movies_data]
    return movies


@router.get('/movies/{movie_id}', response_model=schemas.MovieInfo)
async def get_movie_informations(
    movie_id: int,
    current_user: Annotated[user_models.User, Depends(security.get_current_user)],
    db: Session = Depends(get_db)
):
    movie = get_movie_by_id(db, movie_id)
    if not movie:
        movie_cached = redis_client.get(f"movie:{movie_id}")
        if not movie_cached:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Movie not available")
        movie_cached = json.loads(movie_cached)
        movie = create_movie(db, map_to_movie(movie_cached))
    return movie


@router.get('/movies/{movie_id}/stream')
async def start_streaming(
    movie_id: int,
    current_user: Annotated[user_models.User, Depends(security.get_current_user)],
    db: Session = Depends(get_db)
):
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

    watched_movie = get_watched_movie(db, current_user.id, movie_id)
    if not watched_movie:
        mark_movie_as_watched(db, current_user.id, movie_id)
    else:
        watched_movie.watched_at = datetime.now()
        db.commit()
    
    if not movie.file_path:
        file_path = await download_torrent(movie)
        movie.file_path = file_path
        db.commit()

    # return StreamingResponse(file_streamer(movie.file_path), media_type="video/mp4")
