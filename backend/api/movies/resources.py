from typing import Annotated
from fastapi import (
    Depends, Response, HTTPException, APIRouter, status, BackgroundTasks
)
from sqlalchemy.orm import Session
import json
from typing import List
from datetime import datetime
from fastapi.responses import FileResponse
from .schemas import MovieDisplay
from api.redis_client import redis_client
from api.database import get_db
from api.users.models import User
from api.login import security
from .fetch import (
    get_magnet_link_piratebay,
    fetch_movie_detail_tmdb,
    fetch_top_rated_movies_tmdb,
    fetch_genres_movies_tmdb,
    search_movies_tmdb
)
from .crud import (
    get_watched_movies_id,
    get_watched_movie,
    get_movie_by_id,
    create_movie,
    map_to_movie_info,
    mark_movie_as_watched,
    map_to_movie_display
)
from . import schemas
import os
from .models import Movie
from sqlalchemy import cast
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.types import Text
from .download import download_torrent
from pathlib import Path
import io
import zipfile
from .hls import convert_to_hls, HLS_MOVIES_FOLDER
from ..database import SessionLocal
from ..websocket.websocket_manager import manager_websocket


router = APIRouter(tags=["Movies"])


@router.get('/movies/top', response_model=List[schemas.MovieDisplay])
async def get_top_rated_movies(
    language: str,
):
    cached_top_rated = redis_client.get(f"top_rated_movies:{language}")
    if cached_top_rated:
        movies_data = json.loads(cached_top_rated)
    else:
        movies_data = await fetch_top_rated_movies_tmdb(language)
        if not movies_data:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Top rated movies not available")

    cached_genres = redis_client.get(f"genres_movies:{language}")
    if cached_genres:
        genres = json.loads(cached_genres)
    else:
        genres = await fetch_genres_movies_tmdb(language)
        if not genres:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Genres for movies not available")

    movies = [map_to_movie_display(movie, genres) for movie in movies_data]
    if not movies:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Top rated movies not available")

    return movies


def get_redis_key(
    searchBody: schemas.SearchMovieBody = None,
    popularMovieBody: schemas.PopularMovieBody = None
) -> str:

    """
    Get the redis key based on the search or popular movie request
    """

    if searchBody is None and popularMovieBody is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid request"
        )

    type = "search" if searchBody is not None else "popular"
    body = searchBody if searchBody is not None else popularMovieBody
    language = body.language
    page = body.page
    sort_options = body.sort_options
    filter_options = body.filter_options
    filter_options_key = f"{filter_options.categories}:{filter_options.imdb_rating_low}:{filter_options.imdb_rating_high}:{filter_options.production_year_low}:{filter_options.production_year_high}"
    sort_options_key = f"{sort_options.type.value}:{sort_options.ascending}"
    redis_key = f"{type}:{language}:{page}:{sort_options_key}:{filter_options_key}"
    return redis_key


@router.post('/movies/search', response_model=List[MovieDisplay])
async def search_movies(
    searchBody: schemas.SearchMovieBody,
    current_user: Annotated[
        User,
        Depends(security.get_current_user)
    ],
    db: Session = Depends(get_db)
):

    search = searchBody.search
    language = searchBody.language
    page = searchBody.page
    sort_options = searchBody.sort_options
    filter_options = searchBody.filter_options

    sort_column = {
        "none": Movie.title,
        "name": Movie.title,
        "production_year": Movie.release_date,
        "imdb_rating": Movie.vote_average,
    }.get(sort_options.type.value, Movie.popularity)

    # redis_key = get_redis_key(searchBody=searchBody)
    # cached_searches = redis_client.get(redis_key)
    cached_searches = False
    if cached_searches:
        movies_data = json.loads(cached_searches)
    else:

        # Search movies in TMDB and add to database
        genres = await fetch_genres_movies_tmdb(language)

        # Search key in redis
        already_search_key = f"search:{search}:{language}"
        already_searched = redis_client.get(already_search_key)
        if not already_searched:
            search_page = 1
            redis_client.setex(already_search_key, 86400, json.dumps(True))
            while True:
                movies_data = await search_movies_tmdb(search, language, search_page)
                if not movies_data:
                    break
                # Add movies to database
                for movie in movies_data:
                    movie_db = get_movie_by_id(db, movie["id"])
                    if not movie_db:
                        categories = []
                        genre_ids = movie.get("genre_ids", None)
                        if genre_ids:
                            for genre in genres:
                                if genre['id'] in genre_ids:
                                    categories.append(genre['name'])
                        print(movie)
                        # movie_db = create_movie(
                        #     db, Movie(
                        #         id=movie["id"],
                        #         original_language=movie["original_language"],
                        #         language=language,
                        #         original_title=movie["original_title"],
                        #         overview=movie["overview"],
                        #         popularity=movie["popularity"],
                        #         poster_path=movie["poster_path"],
                        #         backdrop_path=movie["backdrop_path"],
                        #         release_date=movie["release_date"],
                        #         category=categories,
                        #         title=movie["title"],
                        #         vote_average=movie["vote_average"],
                        #         vote_count=movie["vote_count"]
                        #     )
                        # )
                search_page += 1

        # Search movies in database
        movies_data = db.query(
            Movie.id,
            Movie.title,
            Movie.release_date,
            Movie.vote_average,
            Movie.poster_path
        ) \
            .filter(
                Movie.title.ilike(f"%{search}%"),
                Movie.language == language,
                Movie.category.op("&&")(cast([filter_options.categories], ARRAY(Text))) if filter_options.categories != "All" else True,
                Movie.vote_average >= filter_options.imdb_rating_low,
                Movie.vote_average <= filter_options.imdb_rating_high,
                Movie.release_date >= str(filter_options.production_year_low) + '-01-01',
                Movie.release_date <= str(filter_options.production_year_high) + '-12-31'
            ) \
            .order_by(
                sort_column.asc() if (sort_options.ascending or sort_options.type.value == "none")
                else sort_column.desc()) \
            .offset((page - 1) * 20) \
            .limit(20) \
            .all()

        if not movies_data:
            raise HTTPException(
                status_code=status.HTTP_204_NO_CONTENT,
                detail="Search movies not available"
            )

        # redis_client.set(redis_key, json.dumps(movies_data))

    watched_movies = get_watched_movies_id(db, current_user.id)

    movies = [
        MovieDisplay(**{
            "id": movie.id,
            "title": movie.title,
            "release_date": movie.release_date,
            "vote_average": movie.vote_average,
            "poster_path": movie.poster_path,
            "is_watched": movie.id in watched_movies,
            "category": []
        }) for movie in movies_data
    ]

    if not movies:
        raise HTTPException(
            status_code=status.HTTP_204_NO_CONTENT,
            detail="Search movies not available"
        )

    return movies


@router.post('/movies/popular/{page}', response_model=List[MovieDisplay])
async def get_popular_movies(
    popularMovieBody: schemas.PopularMovieBody,
    current_user: Annotated[User, Depends(security.get_current_user)],
    db: Session = Depends(get_db)
):

    page = popularMovieBody.page
    language = popularMovieBody.language
    filter_options: schemas.FilterOption = popularMovieBody.filter_options
    sort_options = popularMovieBody.sort_options

    sort_column = {
        "none": Movie.popularity,
        "name": Movie.title,
        "production_year": Movie.release_date,
        "imdb_rating": Movie.vote_average,
    }.get(sort_options.type.value, Movie.id)

    redis_key = get_redis_key(popularMovieBody=popularMovieBody)
    cached_movies = redis_client.get(redis_key)
    cached_movies = False
    if cached_movies:
        movies_data = json.loads(cached_movies)
    else:
        movies_data = db.query(
            Movie.id,
            Movie.title,
            Movie.release_date,
            Movie.vote_average,
            Movie.poster_path
        ).filter(
            Movie.language == language,
            Movie.category.op("&&")(cast([filter_options.categories], ARRAY(Text))) if filter_options.categories != "All" else True,
            Movie.vote_average >= filter_options.imdb_rating_low,
            Movie.vote_average <= filter_options.imdb_rating_high,
            Movie.release_date >= str(filter_options.production_year_low) + '-01-01',
            Movie.release_date <= str(filter_options.production_year_high) + '-12-31'
        ).order_by(
            sort_column.asc() if sort_options.ascending
            else sort_column.desc()
        ).offset(
            (page - 1) * 20
        ).limit(20).all()

        if not movies_data:
            raise HTTPException(
                status_code=status.HTTP_204_NO_CONTENT,
                detail="No movies found"
            )

    if not movies_data:
        raise HTTPException(
            status_code=status.HTTP_204_NO_CONTENT,
            detail="No movies found"
        )

    watched_movies = get_watched_movies_id(db, current_user.id)

    movies = [
        MovieDisplay(**{
            "id": movie.id,
            "title": movie.title,
            "release_date": movie.release_date,
            "vote_average": movie.vote_average,
            "poster_path": movie.poster_path,
            "is_watched": movie.id in watched_movies,
            "category": []
        }) for movie in movies_data
    ]

    # TODO: Add to redis cache

    return movies


# Get movies informations : vote_average (min and max), release_date (min and
# max) and genres, used in the filter / sort menu of the frontend.
@router.get('/movies/informations', response_model=schemas.MovieInformations)
async def get_movies_informations(
    language: str,
    current_user: Annotated[User, Depends(security.get_current_user)],
    db: Session = Depends(get_db)
):

    if not language or language not in ["en", "fr"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid language"
        )

    movies_informations = db.query(
        Movie.category,
        Movie.vote_average,
        Movie.release_date
    ).filter(
        Movie.language == language
    ).all()

    if not movies_informations:
        raise HTTPException(
            status_code=status.HTTP_204_NO_CONTENT,
            detail="No movies found"
        )

    vote_average = [movie.vote_average for movie in movies_informations if movie.vote_average]
    release_date = [movie.release_date for movie in movies_informations if movie.release_date]
    genres = {str(genre) for movie in movies_informations for genre in movie.category}

    informations = {
        "vote_average": {
            "min": min(vote_average),
            "max": max(vote_average)
        },
        "release_date": {
            "min": min([int(date.split('-')[0]) for date in release_date]) if release_date else 1900,
            "max": max([int(date.split('-')[0]) for date in release_date]) if release_date else datetime.datetime.now().year
        },
        "genres": ["All"] + sorted(list(genres))
    }

    return informations


@router.get('/movies/{movie_id}', response_model=schemas.MovieInfo)
async def get_movie_informations(
    movie_id: int,
    language: str,
    current_user: Annotated[User, Depends(security.get_current_user)],
    db: Session = Depends(get_db)
):
    cached_detailed_movie = redis_client.get(
        f"detailed_movie:{movie_id}:{language}"
    )
    if cached_detailed_movie:
        detailed_movie = json.loads(cached_detailed_movie)
    else:
        detailed_movie = await fetch_movie_detail_tmdb(movie_id, language)
        if not detailed_movie:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Detailed movie not available"
            )

    db_movie = get_movie_by_id(db, movie_id)
    if not db_movie:
        db_movie = create_movie(
            db,
            detailed_movie['id'],
            detailed_movie['original_title'],
            detailed_movie['release_date']
        )

    return map_to_movie_info(detailed_movie, db_movie)


async def download_and_convert(movie_id: int, user_id: int):
    redis_client.set(f"download_and_convert:{movie_id}", 1)
    file_path = ""

    db = SessionLocal()
    try:
        movie = get_movie_by_id(db, movie_id)
        if movie.is_download is False:
            await manager_websocket.send_message(
                user_id, "Movie is downloading."
            )
            file_path = await download_torrent(movie.magnet_link, movie.id)
            movie.file_path = file_path
            movie.is_download = True
            db.commit()
        if movie.is_convert is False:
            await manager_websocket.send_message(
                user_id,
                "Movie is being converted to HLS."
            )
            await convert_to_hls(movie.file_path, movie.id)
            movie.is_convert = True
            db.commit()
    finally:
        db.close()

    redis_client.delete(f"download_and_convert:{movie.id}")
    await manager_websocket.send_message(
        user_id, "Movie is ready."
    )


@router.post('/movies/{movie_id}/download')
async def download_movie(
    movie_id: int,
    background_tasks: BackgroundTasks,
    current_user: Annotated[User, Depends(security.get_current_user)],
    db: Session = Depends(get_db)
):

    # Status_code tests:
    # 400 : Invalid movie
    # raise HTTPException(
    #     status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid movie"
    # )
    # 404 : Movie not available
    # raise HTTPException(
    #     status_code=status.HTTP_404_NOT_FOUND,
    #     detail="Movie not available"
    # )
    # 202 : Movie is downloading
    # return Response(status_code=status.HTTP_202_ACCEPTED)
    # 200 : Movie is already downloaded and converted
    return Response(status_code=status.HTTP_200_OK)

    movie = get_movie_by_id(db, movie_id)
    if not movie:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid movie"
        )

    if movie.is_download and movie.is_convert:
        return Response(status_code=status.HTTP_200_OK)

    if not movie.magnet_link:
        year = datetime.strptime(movie.release_date, "%Y-%m-%d").year
        magnet_link = await get_magnet_link_piratebay(
            movie.original_title, year)
        if not magnet_link:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Movie not available"
            )
        movie.magnet_link = magnet_link
        db.commit()

    if not redis_client.exists(f"download_and_convert:{movie_id}"):
        background_tasks.add_task(
            download_and_convert, movie_id, current_user.id)

    db.refresh(movie)
    if movie.is_download and movie.is_convert:
        return Response(status_code=status.HTTP_200_OK)

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
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid movie"
        )

    file_path = f"{HLS_MOVIES_FOLDER}/movie_{movie_id}/{hls_file}"
    if not os.path.exists(file_path):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Movie not downloaded"
        )

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
    current_user: Annotated[User, Depends(security.get_current_user)],
    db: Session = Depends(get_db)
):
    movie = get_movie_by_id(db, movie_id)
    if not movie:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid movie"
        )

    if movie.is_download is False:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Movie not downloaded"
        )

    dir_path = os.path.dirname(movie.file_path)
    if not dir_path:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subtitles not available"
        )

    subtitles = [filename for filename in Path(dir_path).rglob('*.srt')]
    if not subtitles:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subtitles not available"
        )

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
