from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
from apscheduler.triggers.cron import CronTrigger
from datetime import datetime, timedelta
from sqlalchemy.orm import Session

from api.login.resources import router as login_router
from api.users.resources import router as users_router
from api.movies.resources import router as movies_router
from api.comments.resources import router as comments_router

from api.movies.crud import get_watched_movies
from api.movies.models import Movie, MovieWatched
from api.database import get_db
import shutil

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(SessionMiddleware, secret_key="some-random-string") ###################

app.include_router(login_router)
app.include_router(users_router)
app.include_router(movies_router)
app.include_router(comments_router)


def delete_one_month_movie(db: Session):
    one_month_ago = datetime.utcnow() - timedelta(days=30)

    unwatched_movies = (
        db.query(Movie)
        .filter(~Movie.id.in_(
            db.query(MovieWatched.movie_id)
            .filter(MovieWatched.watched_at >= one_month_ago)
        ))
        .all()
    )

    for movie in unwatched_movies:
        shutil.rmtree(movie.file_path)
        db.delete(movie)
        print(f"Movie {movie.title} deleted.")

    db.commit()

scheduler = BackgroundScheduler()


from api.movies.fetch import fetch_popular_movies_tmdb
from api.movies.crud import get_movie_by_id, create_movie, map_to_movie
from .database import SessionLocal

def populate_movies(db: Session):
    languages = ["en", "fr"]
    for language in languages:
        page = 1
        while page <= 20:
            movies_data = fetch_popular_movies_tmdb(language, page)
            if not movies_data:
                break
            print(f"Processing page {page}")
            print(f"Movies found: {len(movies_data)}")
            for movie in movies_data:
                try:
                    print(f"Processing movie {movie['id']}")
                    movie_db = get_movie_by_id(db, movie["id"])
                    if not movie_db:
                        movie_db = create_movie(db, map_to_movie(movie))
                except Exception as e:
                    print(f"Error processing movie {movie['id']}: {e}")
            page += 1


@app.on_event("startup")
def start_scheduler():
    scheduler.add_job(
        delete_one_month_movie,
        CronTrigger(hour=0, minute=0),
        args=[get_db()]
    )
    scheduler.start()


@app.on_event("startup")
async def startup_event():
    with SessionLocal() as session:
        populate_movies(session)



@app.on_event("shutdown")
def shutdown_scheduler():
    scheduler.shutdown()