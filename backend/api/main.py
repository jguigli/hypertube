from fastapi import FastAPI
from starlette.middleware.sessions import SessionMiddleware
from fastapi.middleware.cors import CORSMiddleware
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session

from api.login.resources import router as login_router
from api.users.resources import router as users_router
from api.movies.resources import router as movies_router
from api.comments.resources import router as comments_router
from api.websocket.websocket_manager import router as websocket_router

from api.movies.models import Movie, MovieWatched
from api.movies.hls import HLS_MOVIES_FOLDER
from api.database import SessionLocal
import shutil
from api.movies.fetch import (
    fetch_popular_movies_tmdb, fetch_genres_movies_tmdb
)
from api.movies.crud import get_movie_by_id
import os
import asyncio
import requests
from .config import JACKETT_API_KEY
from api.movies.search import (
    parse_jackett_results, find_movie_categories, add_movie_to_database
)


app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

secret_string = os.urandom(32).hex()
app.add_middleware(SessionMiddleware, secret_key=secret_string)

app.include_router(login_router)
app.include_router(users_router)
app.include_router(movies_router)
app.include_router(comments_router)
app.include_router(websocket_router)


def delete_one_month_movie():
    one_month_ago = datetime.now(tz=timezone.utc) - timedelta(days=30)

    db = SessionLocal()
    try:
        unwatched_movies = (
            db.query(Movie)
            .join(MovieWatched, MovieWatched.movie_id == Movie.id)
            .filter(MovieWatched.watched_at <= one_month_ago)
            .all()
        )

        for movie in unwatched_movies:
            dir_path = os.path.dirname(movie.file_path)
            if not dir_path:
                os.remove(movie.file_path)
            else:
                shutil.rmtree(dir_path)
            shutil.rmtree(f"{HLS_MOVIES_FOLDER}/movie_{movie.id}")
            db.delete(movie)
        db.commit()

    finally:
        db.close()


scheduler = BackgroundScheduler()


async def populate_movies():

    return

    db = SessionLocal()

    # Return if there are already movies in the database
    if db.query(Movie).first():
        return

    JACKETT_URL = "http://nginx:8080/jackett/api/v2.0/indexers/all/results"

    languages = ["en", "fr"]
    for language in languages:
        genres = await fetch_genres_movies_tmdb(language)
        page = 1
        while True:
            movies_data = await fetch_popular_movies_tmdb(language, page)
            if not movies_data:
                break
            for movie in movies_data:
                try:
                    params = {
                        "apikey": JACKETT_API_KEY,
                        "Query": movie["original_title"],
                    }
                    response = requests.get(
                        JACKETT_URL, params=params, timeout=100
                    )
                    response.raise_for_status()
                    data = response.json()
                    results = parse_jackett_results(data)
                    unique_imdb_ids = set(
                        result['imdb_id'] for result in results if result["imdb_id"]
                    )

                    if not unique_imdb_ids:
                        # No valid results found
                        continue

                    # Check if the movie already exists in the database
                    movie_db = get_movie_by_id(db, movie["id"])
                    if not movie_db:
                        categories = find_movie_categories(
                            genres=genres,
                            tmdb_data=movie
                        )
                        add_movie_to_database(
                            db=db,
                            language=language,
                            tmdb_data=movie,
                            categories=categories
                        )


                    # END
                    # movie_db = get_movie_by_id(db, movie["id"])
                    # if not movie_db:
                    #     categories = []
                    #     genre_ids = movie.get("genre_ids", None)
                    #     if genre_ids:
                    #         for genre in genres:
                    #             if genre['id'] in genre_ids:
                    #                 categories.append(genre['name'])
                    #     movie_db = create_movie(
                    #         db, Movie(
                    #             id=movie["id"],
                    #             original_language=movie["original_language"],
                    #             language=language,
                    #             original_title=movie["original_title"],
                    #             overview=movie["overview"],
                    #             popularity=movie["popularity"],
                    #             poster_path=movie["poster_path"],
                    #             backdrop_path=movie["backdrop_path"],
                    #             release_date=movie["release_date"],
                    #             category=categories,
                    #             title=movie["title"],
                    #             vote_average=movie["vote_average"],
                    #             vote_count=movie["vote_count"]
                    #         )
                    #     )
                except Exception as e:
                    print(f"Error processing movie {movie['id']}: {e}")
            page += 1
            if page > 10:
                break


@app.on_event("startup")
def start_scheduler():
    scheduler.add_job(
        delete_one_month_movie,
        CronTrigger(second=10)
    )
    scheduler.start()


@app.on_event("startup")
async def startup_event():
    asyncio.create_task(populate_movies())


@app.on_event("shutdown")
def shutdown_scheduler():
    scheduler.shutdown()
