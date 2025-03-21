from typing import Annotated
from fastapi import Depends, Response, HTTPException, APIRouter, status, BackgroundTasks
from sqlalchemy.orm import Session
import json
from typing import List
from datetime import datetime
from fastapi.responses import FileResponse

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
from .download import download_torrent
import os
from pathlib import Path
import io
import zipfile
from .hls import convert_to_hls, HLS_MOVIES_FOLDER
from ..database import SessionLocal
from ..websocket.websocket_manager import manager_websocket

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
        movies_data = await search_movies_tmdb(search, language, page)
        if not movies_data:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Search movie not available")
        
    cached_genres = redis_client.get(f"genres_movies:{language}")
    if cached_genres:
        genres = json.loads(cached_genres)
    else:
        genres = await fetch_genres_movies_tmdb(language)
        if not genres:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Genres for movies not available")

    if current_user:
        watched_movies = get_watched_movies_id(db, current_user.id)

        for movie in movies_data:
            movie["is_watched"] = movie["id"] in watched_movies

    movies = [map_to_movie_display(movie, genres) for movie in movies_data]
    if not movies:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Search movie not available")
    
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
        movies_data = await fetch_popular_movies_tmdb(language, page)
        if not movies_data:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Popular movies not available")
        
    cached_genres = redis_client.get(f"genres_movies:{language}")
    if cached_genres:
        genres = json.loads(cached_genres)
    else:
        genres = await fetch_genres_movies_tmdb(language)
        if not genres:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Genres for movies not available")

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
        detailed_movie = await fetch_movie_detail_tmdb(movie_id, language)
        if not detailed_movie:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Detailed movie not available")
        
    db_movie = get_movie_by_id(db, movie_id)
    if not db_movie:
        db_movie = create_movie(db, detailed_movie['id'], detailed_movie['original_title'], detailed_movie['release_date'])

    return map_to_movie_info(detailed_movie, db_movie)


async def download_and_convert(movie_id: int, user_id: int):
    redis_client.set(f"download_and_convert:{movie_id}", 1)
    file_path = ""

    db = SessionLocal()
    try:
        movie = get_movie_by_id(db, movie_id)
        if movie.is_download is False:
            await manager_websocket.send_message(user_id, f"Movie {movie.original_title} is downloading.")
            file_path = await download_torrent(movie.magnet_link, movie.id)
            movie.file_path = file_path
            movie.is_download = True
            db.commit()
        if movie.is_convert is False:
            await manager_websocket.send_message(user_id, f"Movie {movie.original_title} is being converted to HLS.")
            await convert_to_hls(movie.file_path, movie.id)
            movie.is_convert = True
            db.commit()
    finally:
        db.close()

    redis_client.delete(f"download_and_convert:{movie.id}")
    await manager_websocket.send_message(user_id, f"Movie {movie.original_title} is ready to be watch.")


@router.post('/movies/{movie_id}/download')
async def download_movie(
    movie_id: int,
    background_tasks: BackgroundTasks,
    current_user: Annotated[user_models.User, Depends(security.get_current_user_authentified_or_anonymous)],
    db: Session = Depends(get_db)
):
    movie = get_movie_by_id(db, movie_id)
    if not movie:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid movie")
    
    if movie.is_download and movie.is_convert:
        return Response(status_code=200)
    
    if not movie.magnet_link:
        year = datetime.strptime(movie.release_date, "%Y-%m-%d").year
        magnet_link = await get_magnet_link_piratebay(movie.original_title, year)
        if not magnet_link:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Movie not available")
        movie.magnet_link = magnet_link
        db.commit()

    if not redis_client.exists(f"download_and_convert:{movie_id}"):
        background_tasks.add_task(download_and_convert, movie_id, current_user.id)

    return Response(status_code=status.HTTP_202_ACCEPTED)
    

@router.get('/movies/{movie_id}/stream/{token}/{hls_file}')
async def stream_movie(
    movie_id: int,
    token: str,
    hls_file: str,
    db: Session = Depends(get_db)
):
    current_user = security.get_current_user_streaming(token, db)
    movie = get_movie_by_id(db, movie_id)
    if not movie:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid movie")

    file_path = f"{HLS_MOVIES_FOLDER}/movie_{movie_id}/{hls_file}"
    if not os.path.exists(file_path):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Movie not downloaded")
    
    watched_movie = get_watched_movie(db, current_user.id, movie_id)
    if not watched_movie:
        mark_movie_as_watched(db, current_user.id, movie_id)
    else:
        watched_movie.watched_at = datetime.now()
        db.commit()

    return FileResponse(file_path, media_type="application/vnd.apple.mpegurl")


@router.get('/movies/{movie_id}/subtitles')
async def get_subtitles(
    movie_id: int,
    current_user: Annotated[user_models.User, Depends(security.get_current_user_authentified_or_anonymous)],
    db: Session = Depends(get_db)
):
    movie = get_movie_by_id(db, movie_id)
    if not movie:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid movie")

    if movie.is_download is False:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Movie not downloaded")
    
    dir_path = os.path.dirname(movie.file_path)
    if not dir_path:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Subtitles not available")
    
    subtitles = [filename for filename in Path(dir_path).rglob('*.srt')]
    if not subtitles:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Subtitles not available")

    zip_buffer = io.BytesIO()

    with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zip_file:
        for file_path in subtitles:
            zip_file.write(file_path, arcname=file_path.name)

    zip_buffer.seek(0)

    return Response(
        zip_buffer.getvalue(),
        media_type="application/zip",
        headers={"Content-Disposition": "attachment; filename=files.zip"}
    )
