from typing import Annotated
from fastapi import Depends, Response, HTTPException, APIRouter, Depends, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
import requests
import json

from api.database import get_db
from .models import Movie, MovieWatched
from .schemas import MovieDisplay, MovieInfo


def map_to_movie_display(tmdb_movie):
    data = {
        "id": tmdb_movie["id"],
        "title": tmdb_movie["title"],
        "release_date": tmdb_movie["release_date"],
        "category": tmdb_movie.get("genre_ids", None),
        "vote_average": tmdb_movie["vote_average"],
        "poster_path": tmdb_movie.get("poster_path", None),
        "is_watched": tmdb_movie.get("is_watched", False)
    }
    return MovieDisplay(**data)

def map_to_movie(tmdb_movie, language):
    data = {
        "id": tmdb_movie["id"],
        "original_language": tmdb_movie["original_language"],
        "language": language,
        "original_title": tmdb_movie["original_title"],
        "overview": tmdb_movie["overview"],
        "popularity": tmdb_movie["popularity"],
        "poster_path": tmdb_movie.get("poster_path", None),
        "backdrop_path": tmdb_movie.get("backdrop_path", None),
        "release_date": tmdb_movie["release_date"],
        "category": tmdb_movie.get("genre_ids", None),
        "title": tmdb_movie["title"],
        "vote_average": tmdb_movie["vote_average"],
        "vote_count": tmdb_movie["vote_count"],
    }
    return Movie(**data)


##################### Movies #####################

def get_movie_by_id(db: Session, movie_id: int):
    return db.query(Movie).filter(Movie.id == movie_id).first()

def create_movie(db: Session, movie: Movie):
    db_movie = Movie(
        id=movie.id,
        original_language=movie.original_language,
        language=movie.language,
        original_title=movie.original_title,
        overview=movie.overview,
        popularity=movie.popularity,
        poster_path=movie.poster_path,
        backdrop_path=movie.backdrop_path,
        release_date=movie.release_date,
        category=movie.category,
        title=movie.title,
        vote_average=movie.vote_average,
        vote_count=movie.vote_count
    )
    db.add(db_movie)
    db.commit()
    db.refresh(db_movie)
    return db_movie


##################### Watched Movies #####################

def get_watched_movie(db: Session, user_id: int, movie_id: int):
    return db.query(MovieWatched).filter(MovieWatched.user_id == user_id).filter(MovieWatched.movie_id == movie_id).first()

def get_watched_movies(db: Session, user_id: int):
    return db.query(MovieWatched).filter(MovieWatched.user_id == user_id).all()

def get_watched_movies_id(db: Session, user_id: int):
    watched_movies = db.query(MovieWatched).filter(MovieWatched.user_id == user_id).all()
    return [row.movie_id for row in watched_movies]

def mark_movie_as_watched(db: Session, user_id: int, movie_id: int):
    db_movie_watched = MovieWatched(
        movie_id=movie_id,
        user_id=user_id
        )
    db.add(db_movie_watched)
    db.commit()
    db.refresh(db_movie_watched)
    return db_movie_watched





