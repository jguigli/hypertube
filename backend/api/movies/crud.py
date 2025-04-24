from sqlalchemy.orm import Session
from .models import Movie, MovieWatched
from .schemas import MovieDisplay, MovieInfo


def map_to_movie_display(tmdb_movie, genres):
    categories = []
    genre_ids = tmdb_movie.get("genre_ids", None)
    if genre_ids:
        for genre in genres:
            if genre['id'] in genre_ids:
                categories.append(genre['name'])
    else:
        categories = None

    data = {
        "id": tmdb_movie["id"],
        "title": tmdb_movie["title"],
        "release_date": tmdb_movie["release_date"],
        "category": categories,
        "vote_average": tmdb_movie["vote_average"],
        "poster_path": tmdb_movie.get("poster_path", None),
        "is_watched": tmdb_movie.get("is_watched", False)
    }
    return MovieDisplay(**data)


def map_to_movie_info(tmdb_movie, movie: Movie):
    genres_list = tmdb_movie.get("genres", None)
    if genres_list:
        genres = [genre['name'] for genre in genres_list]
    else:
        genres = None

    casts = []
    credit = tmdb_movie.get("credits", None)
    if credit:
        casts_list = credit['cast']
    else:
        casts_list = None
    if casts_list:
        casts = [{'name': cast['name'], 'role': cast['known_for_department']} for cast in casts_list]
    else:
        casts = None

    crew = []
    if credit:
        crew_list = credit['crew']
    else:
        crew_list = None
    if crew_list:
        crew = [{'name': cast['name'], 'role': cast['known_for_department']} for cast in crew_list]
    else:
        crew = None

    data = {
        "id": tmdb_movie["id"],
        "imdb_id": tmdb_movie["imdb_id"],
        "adult": tmdb_movie["adult"],
        "original_language": tmdb_movie["original_language"],
        "original_title": tmdb_movie["original_title"],
        "overview": tmdb_movie["overview"],
        "popularity": tmdb_movie["popularity"],
        "poster_path": tmdb_movie.get("poster_path", None),
        "backdrop_path": tmdb_movie.get("backdrop_path", None),
        "release_date": tmdb_movie["release_date"],
        "category": genres,
        "title": tmdb_movie["title"],
        "runtime": tmdb_movie["runtime"],
        "vote_average": tmdb_movie["vote_average"],
        "vote_count": tmdb_movie["vote_count"],
        "casting": casts,
        "crew": crew,
        "comments": movie.comments
    }
    return MovieInfo(**data)


# #################### Movies #####################

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


# #################### Watched Movies #####################

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
