from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
from apscheduler.triggers.cron import CronTrigger
from datetime import datetime, timedelta
from sqlalchemy.orm import Session

from api.login.resources import router as login_router
from api.users.resources import router as users_router
from api.movies.resources import router as movies_router
from api.comments.resources import router as comments_router
from api.websocket.websocket_manager import router as websocket_router

from api.movies.crud import get_watched_movies
from api.movies.models import Movie, MovieWatched
from api.database import get_db
from api.movies.hls import HLS_MOVIES_FOLDER
from api.database import SessionLocal
import shutil
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(login_router)
app.include_router(users_router)
app.include_router(movies_router)
app.include_router(comments_router)
app.include_router(websocket_router)


def delete_one_month_movie():
    one_month_ago = datetime.utcnow() - timedelta(days=30)

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

@app.on_event("startup")
def start_scheduler():
    scheduler.add_job(
        delete_one_month_movie,
        CronTrigger(hour=0, minute=0)
    )
    scheduler.start()

@app.on_event("shutdown")
def shutdown_scheduler():
    scheduler.shutdown()