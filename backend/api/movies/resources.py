from typing import Annotated
from fastapi import (
    Depends, Response, HTTPException, APIRouter, status, BackgroundTasks, Request
)

from sqlalchemy.orm import Session
import json
from typing import List
from datetime import datetime
from fastapi.responses import FileResponse, StreamingResponse
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
    fetch_movie_tmdb,
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
from .search import (
    search_in_db,
    find_movie_categories,
    parse_jackett_results,
    add_movie_to_database
)
from api.movies.download import file_streamer, convert_stream
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
import requests
from api.config import JACKETT_API_KEY, OPENSUBTITLES_API_KEY
from api.comments.schemas import Comment


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

    # redis_key = get_redis_key(searchBody=searchBody)
    # cached_searches = redis_client.get(redis_key)
    cached_searches = False
    if cached_searches:
        movies_data = json.loads(cached_searches)
    else:

        JACKETT_URL = "http://nginx:8080/jackett/api/v2.0/indexers/all/results"

        # Search movies on Jackett
        params = {
            "apikey": JACKETT_API_KEY,
            "Query": search
        }
        try:
            response = requests.get(
                JACKETT_URL, params=params, timeout=100
            )
            response.raise_for_status()
            data = response.json()
            results = parse_jackett_results(data)
            print(f"Jackett results: {results}")
            unique_imdb_ids = set(
                result['imdb_id'] for result in results if result["imdb_id"]
            )
            genres = await fetch_genres_movies_tmdb(language)
            # Fetch movie details from TMDB for each unique IMDb ID
            for imdb_id in unique_imdb_ids:
                print(f"Fetching movie data for IMDb ID: {imdb_id}")
                tmdb_data = await fetch_movie_tmdb(imdb_id, language)

                if not tmdb_data:
                    print(f"Movie data not found for IMDb ID: {imdb_id}")
                    continue

                # Check if the movie already exists in the database
                movie_db = get_movie_by_id(db, tmdb_data["id"])
                if not movie_db:
                    categories = find_movie_categories(
                        genres=genres,
                        tmdb_data=tmdb_data
                    )
                    add_movie_to_database(
                        db=db,
                        language=language,
                        tmdb_data=tmdb_data,
                        categories=categories
                    )
        except Exception as e:
            print(f"Error fetching data from Jackett: {e}")
            raise HTTPException(status_code=400, detail=str(e))

    #     genres = await fetch_genres_movies_tmdb(language)
    #     # Search movies on YTS
    #     search_page = 1
    #     while True:
    #         yts_movies = search_yts_movies(search, page=search_page)
    #         if not yts_movies:
    #             break
    #         for movie in yts_movies:
    #             imdb_id = movie.get("imdb_code", None)
    #             if not imdb_id:
    #                 continue
    #             tmdb_data = await fetch_movie_tmdb(imdb_id, language)
    #             if not tmdb_data:
    #                 continue
    #             movie_db = get_movie_by_id(db, tmdb_data["id"])
    #             if not movie_db:
    #                 categories = find_movie_categories(genres, tmdb_data)
    #                 add_movie_to_database(db, language, tmdb_data, categories)
    #         search_page += 1

    sort_column = {
        "none": Movie.title,
        "name": Movie.title,
        "production_year": Movie.release_date,
        "imdb_rating": Movie.vote_average,
    }.get(sort_options.type.value, Movie.popularity)

    # Search movies in database
    movies_data = search_in_db(
        db, search, language, page, sort_options, filter_options, sort_column
    )

    if not movies_data:
        raise HTTPException(
            status_code=status.HTTP_204_NO_CONTENT,
            detail="Search movies not available"
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
        informations = {
            "vote_average": {
                "min": 0,
                "max": 10
            },
            "release_date": {
                "min": datetime.now().year - 100,
                "max": datetime.now().year
            },
            "genres": ["All"]
        }

        return informations

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
            "max": max([int(date.split('-')[0]) for date in release_date]) if release_date else datetime.now().year
        },
        "genres": ["All"] + sorted(list(genres))
    }

    return informations


@router.get('/movies/{movie_id}', response_model=schemas.MovieInfo)
async def get_movie_informations(
    movie_id: int,
    language: str,
    background_tasks: BackgroundTasks,
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
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Detailed movie not available"
            )

    db_movie = get_movie_by_id(db, movie_id)
    if not db_movie:
        db_movie = create_movie(
            db,
            detailed_movie['id'],
            detailed_movie['original_language'],
            detailed_movie['language'],
            detailed_movie['original_title'],
            detailed_movie['overview'],
            detailed_movie['popularity'],
            detailed_movie['poster_path'],
            detailed_movie['backdrop_path'],
            detailed_movie['release_date'],
            detailed_movie['category'],
            detailed_movie['title'],
            detailed_movie['runtime'],
            detailed_movie['vote_average'],
            detailed_movie['vote_count'],
        )

    if db_movie.is_download and not db_movie.is_convert:
        await manager_websocket.send_message(
            current_user.id,
            "Movie is ready to standard streaming."
        )

    if db_movie.is_download and db_movie.is_convert:
        await manager_websocket.send_message(
            current_user.id,
            "Movie is ready to HLS streaming."
        )

    if not db_movie.magnet_link:
        year = datetime.strptime(db_movie.release_date, "%Y-%m-%d").year
        magnet_link = await get_magnet_link_piratebay(db_movie.original_title, year)
        if not magnet_link:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Movie not available")

        db_movie.magnet_link = magnet_link
        db.commit()

    if not redis_client.exists(f"download_and_convert:{movie_id}", 1):
        background_tasks.add_task(download_and_convert, movie_id, current_user.id)

    return map_to_movie_info(detailed_movie, db_movie)


async def download_and_convert(movie_id: int, user_id: int):
    redis_client.set(f"download_and_convert:{movie_id}", 1)

    db = SessionLocal()
    try:
        movie = get_movie_by_id(db, movie_id)
        if movie.is_download is False:
            await download_torrent(movie.magnet_link, movie.id, user_id)
            db.commit()
        # if movie.is_convert is False:
        #     await convert_to_hls(movie.file_path, movie.id)
        #     movie.is_convert = True
        #     db.commit()
    finally:
        redis_client.delete(f"download_and_convert:{movie.id}")
        db.close()

@router.get('/movies/{movie_id}/stream/{token}/{hls_file}')
async def stream_movie_hls(
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


@router.get('/movies/{movie_id}/stream/{token}')
async def standard_stream_movie(
    movie_id: int,
    token: str,
    request: Request,
    db: Session = Depends(get_db)
):
    current_user = security.get_current_user_streaming(token, db)
    movie = get_movie_by_id(db, movie_id)
    if not movie:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid movie")

    watched_movie = get_watched_movie(db, current_user.id, movie_id)
    if not watched_movie:
        mark_movie_as_watched(db, current_user.id, movie_id)
    else:
        watched_movie.watched_at = datetime.now()
        db.commit()

    file_extension = os.path.splitext(movie.file_path)[1].lower().strip(".")

    if file_extension in ['mp4', 'webm']:
        file_size = os.path.getsize(movie.file_path)
        range_header = request.headers.get("range")

        if range_header:
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
    else:
        return StreamingResponse(await convert_stream(movie.file_path), media_type="video/mp4")


def search_subtitles(imdb_id: str, query: str, lang="fr"):

    print(f"Recherche de sous-titres pour {query} ({lang} with {imdb_id})")

    BASE_URL = "https://api.opensubtitles.com/api/v1"

    headers = {
        "Api-Key": OPENSUBTITLES_API_KEY,
        "Content-Type": "application/json",
        "User-Agent": "Hypertube",
    }

    response = requests.get(
        f"{BASE_URL}/subtitles",
        headers=headers,
        params={
            "imdb_id": imdb_id,
            "query": query,
            "languages": lang,
            "order_by": "ratings"
        }
    )
    if response.status_code == 200:
        return response.json()["data"]
    else:
        print("Erreur lors de la recherche :", response.text)
        return []


def download_subtitle(
    file_id: str,
    filename: str,
    file_path: str
):

    BASE_URL = "https://api.opensubtitles.com/api/v1"

    headers = {
        "Api-Key": OPENSUBTITLES_API_KEY,
        "Content-Type": "application/json",
        "User-Agent": "Hypertube",
    }

    file_full_path = os.path.join(os.path.dirname(file_path), filename)

    response = requests.post(
        f"{BASE_URL}/download",
        headers=headers,
        params={"file_id": file_id},
    )
    if response.status_code == 200:
        download_link = response.json()["link"]
        srt = requests.get(download_link)
        with open(file_full_path, "wb") as f:
            f.write(srt.content)
        print(f"Sous-titre téléchargé sous le nom : {file_full_path}")
    else:
        print("Erreur lors du téléchargement :", response.text)


@router.get('/movies/{movie_id}/{token}/subtitles')
async def get_subtitles(
    movie_id: int,
    token: str,
    db: Session = Depends(get_db)
):

    current_user = security.get_current_user_streaming(token, db)
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )

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

    language_dict = {
        "fr": "Français",
        "en": "English"
    }
    subtitles = []
    for lang in ("fr", "en"):

        file_full_path = os.path.join(os.path.dirname(movie.file_path), f"{lang}.srt")
        if not os.path.exists(file_full_path):

            found_subtitles = search_subtitles(movie.imdb_id, movie.title, lang)
            if not found_subtitles:
                print(f"Aucun sous-titre trouvé pour la langue {lang}.")
                continue

            file_id = found_subtitles[0]["attributes"]["files"][0]["file_id"]
            filename = f"{lang}.srt"
            download_subtitle(file_id, filename, movie.file_path)

        subtitles.append({
            "kind": "subtitles",
            "src": "",
            "srcLang": lang,
            "label": language_dict[lang],
        })

    return subtitles


@router.get('/movies/stream/{movie_id}/{token}/subtitles/{lang}')
async def stream_subtitles(
    movie_id: int,
    token: str,
    lang: str,
    db: Session = Depends(get_db)
):
    current_user = security.get_current_user_streaming(token, db)
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )

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

    subtitles = os.path.join(dir_path, f"{lang}.srt")
    if not os.path.exists(subtitles):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subtitles not available"
        )

    def srt_to_vtt(srt_path):
        with open(srt_path, "r", encoding="utf-8") as srt_file:
            yield "WEBVTT\n\n"
            for line in srt_file:
                # Remplacer la virgule par un point dans les timecodes
                yield line.replace(",", ".")

    return StreamingResponse(srt_to_vtt(subtitles), media_type="text/vtt")


@router.get('/movies/{movie_id}/comments', response_model=List[Comment])
async def get_movie_comments(
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
    return movie.comments