from typing import Annotated
from fastapi import Depends, HTTPException, APIRouter, status, Request
from sqlalchemy.orm import Session
import json
from typing import List
from datetime import datetime
from fastapi.responses import StreamingResponse
from .schemas import MovieDisplay
from api.redis_client import redis_client
from api.database import get_db
from api.users import models as user_models
from api.login import security
from .fetch import (
    get_magnet_link_piratebay,
)
from .crud import (
    get_watched_movies_id,
    get_movie_by_id,
    create_movie,
    map_to_movie
)
from . import schemas, models
from .download import file_streamer
import os
import asyncio


router = APIRouter(tags=["Movies"])


@router.post('/movies/search', response_model=List[schemas.MovieDisplay])
async def search_movies(
    searchBody: schemas.SearchMovieBody,
    current_user: Annotated[
        user_models.User,
        Depends(security.get_current_user_authentified_or_anonymous)
    ],
    db: Session = Depends(get_db)
):

    search = searchBody.search
    language = searchBody.language
    page = searchBody.page
    sort_options = searchBody.sort_options

    sort_column = {
        "name": models.Movie.title,
        "production_year": models.Movie.release_date,
        "imdb_rating": models.Movie.vote_average,
        "none": models.Movie.popularity
    }.get(sort_options.type.value, models.Movie.popularity)
    # cached_searches = redis_client.get(f"search:{search}:{language}:{page}")
    # if cached_searches:
    #     movies_data = json.loads(cached_searches)
    # else:
    #     movies_data = search_movies_tmdb(search, language, page)
    #     if not movies_data:
    #         raise HTTPException(status_code=status.HTTP_204_NO_CONTENT, detail="Search movie not available")

    # Search movies in database
    movies_data = db.query(models.Movie.id, models.Movie.title,
                           models.Movie.release_date,
                           models.Movie.vote_average,
                           models.Movie.poster_path) \
                    .filter(models.Movie.title.ilike(f"%{search}%")) \
                    .filter(models.Movie.language == language) \
                    .order_by(
                        sort_column.asc() if sort_options.ascending
                        else sort_column.desc()) \
                    .offset((page - 1) * 20) \
                    .limit(20) \
                    .all()

    if not movies_data:
        raise HTTPException(status_code=status.HTTP_204_NO_CONTENT, detail="Search movie not available")

    #     # # Add to cache
    #     # redis_client.set(f"search:{search}:{language}:{page}", json.dumps(movies_data))

    # if current_user:
    #     watched_movies = get_watched_movies_id(db, current_user.id)
    #     for movie in movies_data:
    #         movie['is_watched'] = movie['id'] in watched_movies

    # movies = [map_to_movie_display(movie) for movie in movies_data]
    # # if not movies:
    # #     raise HTTPException(status_code=status.HTTP_204_NO_CONTENT, detail="Search movie not available")
    # # return movies
    # return movies
    watched_movies = get_watched_movies_id(db, current_user.id) \
        if current_user \
        else []
    movies = [
        MovieDisplay(**{
            "id": movie.id,
            "title": movie.title,
            "release_date": movie.release_date,
            "vote_average": movie.vote_average,
            "poster_path": movie.poster_path,
            "is_watched": movie.id in watched_movies
        }) for movie in movies_data
    ]
    return movies


@router.post('/movies/popular/{page}', response_model=List[schemas.MovieDisplay])
async def get_popular_movies(
    popularMovieBody: schemas.PopularMovieBody,
    current_user: Annotated[user_models.User, Depends(security.get_current_user_authentified_or_anonymous)],
    db: Session = Depends(get_db)
):

    page = popularMovieBody.page
    language = popularMovieBody.language
    filter_options: schemas.FilterOption = popularMovieBody.filter_options
    sort_options = popularMovieBody.sort_options

    print("Filter options: ", filter_options)

    # cached_movies = redis_client.get(f"popular_movies:{page}:{language}")
    # if cached_movies:
    #     movies_data = json.loads(cached_movies)
    # else:
    sort_column = {
        "name": models.Movie.title,
        "production_year": models.Movie.release_date,
        "imdb_rating": models.Movie.vote_average,
        "none": models.Movie.popularity
    }.get(sort_options.type.value, models.Movie.id)

    movies_data = db.query(
        models.Movie.id,
        models.Movie.title,
        models.Movie.release_date,
        models.Movie.vote_average,
        models.Movie.poster_path
    ).filter(
        models.Movie.language == language,
        ) \
        .filter(
                models.Movie.vote_average >= filter_options.imdb_rating_low,
                models.Movie.vote_average <= filter_options.imdb_rating_high,
                models.Movie.release_date >= f"{filter_options.production_year_low}-01-01",
                models.Movie.release_date <= f"{filter_options.production_year_high}-12-31"
            ) \
        .order_by(
            sort_column.asc() if sort_options.ascending
            else sort_column.desc()
        ) \
        .offset((page - 1) * 20) \
        .limit(20) \
        .all()

    if not movies_data:
        raise HTTPException(
            status_code=status.HTTP_204_NO_CONTENT,
            detail="No movies found"
        )

    # Add to cache
    # redis_client.set(f"popular_movies:{page}:{language}", json.dumps(movies_data))

    # Every 1 hour :
    # 1. Fetch popular movies from TMDB
    # 2. Save to database

    # When user request movies : (page, language, filters, sort)
    # get the data from database
    # Apply filters and sort
    # Send the data to user

    watched_movies = get_watched_movies_id(db, current_user.id) \
        if current_user \
        else []

    movies = [
        MovieDisplay(**{
            "id": movie.id,
            "title": movie.title,
            "release_date": movie.release_date,
            "vote_average": movie.vote_average,
            "poster_path": movie.poster_path,
            "is_watched": movie.id in watched_movies
        }) for movie in movies_data
    ]

    # for movie in movies_data:
    #     movie_map = {
    #         "id": movie.id,
    #         "title": movie.title,
    #         "release_date": movie.release_date,
    #         "vote_average": movie.vote_average,
    #         "poster_path": movie.poster_path,
    #         "is_watched": movie.id in watched_movies
    #     }
    #     movies.append(MovieDisplay(**movie_map))

    # movies = [map_to_movie_display(movie) for movie in movies_data]
    # if not movies:
    #     raise HTTPException(status_code=status.HTTP_204_NO_CONTENT, detail="No movies found")

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
    request: Request,
    current_user: Annotated[user_models.User, Depends(security.get_current_user_authentified_or_anonymous)],
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

    # watched_movie = get_watched_movie(db, current_user.id, movie_id)
    # if not watched_movie:
    #     mark_movie_as_watched(db, current_user.id, movie_id)
    # else:
    #     watched_movie.watched_at = datetime.now()
    #     db.commit()

    if not movie.file_path:
        # file_path = await download_torrent(movie.magnet_link, movie.id)
        # asyncio.create_task(download_torrent(movie.magnet_link, movie.id))
        while not redis_client.get(f"movie_path:{movie_id}"):
            await asyncio.sleep(1)
        movie.file_path = redis_client.get(f"movie_path:{movie_id}")
        db.commit()

    file_size = os.path.getsize(movie.file_path)
    range_header = request.headers.get("range") # EDIT TO "Range"

    if range_header:
        print(range_header)
        try:
            start, end = range_header.replace("bytes=", "").split("-")
            start = int(start)
            end = int(end) if end else file_size - 1
            end = min(end, file_size - 1)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid Range request")

        return StreamingResponse(
            file_streamer(movie.file_path, start, end),
            status_code=206,
            media_type="video/mp4",
            headers={
                "Content-Range": f"bytes {start}-{end}/{file_size}",
                "Accept-Ranges": "bytes",
                "Content-Length": str(end - start + 1),
            }
        )

    return StreamingResponse(
        file_streamer(movie.file_path, 0, file_size - 1),
        media_type="video/mp4",
        headers={
            "Content-Length": str(file_size),
            "Accept-Ranges": "bytes",
        }
    )
