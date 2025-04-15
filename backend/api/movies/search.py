import re
import requests
from api.config import OMDB_API_KEY
from api.movies.models import Movie
from sqlalchemy import cast
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.types import Text
from .crud import create_movie


def parse_jackett_results(data):
    results = []
    film_categories = {2000, 2010, 2020, 2030, 2040, 2045}

    for item in data.get("Results", []):
        categories = item.get("Category", [])

        # Filtrer les films
        if not any(cat in film_categories for cat in categories):
            continue

        print("Processing item:", item)

        title = item.get("Title")
        imdb_id = item.get("Imdb") or get_imdb_id_from_title(title)

        if not imdb_id:
            continue

        results.append({
            "title": title,
            "imdb_id": imdb_id,
        })

    return results


def extract_imdb_id(description_link: str) -> str | None:
    """
    Extract IMDb ID from a URL like 'https://www.imdb.com/title/tt1234567/'
    """
    match = re.search(r'tt\d{7,8}', description_link or "")
    return match.group(0) if match else None


def get_imdb_id_from_title(title):
    try:
        response = requests.get("http://www.omdbapi.com/", params={
            "apikey": OMDB_API_KEY,
            "t": title
        })
        response.raise_for_status()
        data = response.json()
        return data.get("imdbID") if data.get("Response") == "True" else None
    except Exception:
        return None


def search_in_db(
    db, search, language, page, sort_options, filter_options, sort_column
):
    movies_data = db.query(
        Movie.id,
        Movie.title,
        Movie.release_date,
        Movie.vote_average,
        Movie.poster_path
    ).filter(
        Movie.title.ilike(f"%{search}%"),
        Movie.language == language,
        Movie.category.op("&&")(
            cast([filter_options.categories], ARRAY(Text))
        ) if filter_options.categories != "All" else True,
        Movie.vote_average >= filter_options.imdb_rating_low,
        Movie.vote_average <= filter_options.imdb_rating_high,
        Movie.release_date >= (
            str(filter_options.production_year_low) + '-01-01'
        ),
        Movie.release_date <= (
            str(filter_options.production_year_high) + '-12-31'
        )
    ).order_by(
        sort_column.asc() if (
            sort_options.ascending or sort_options.type.value == "none"
        ) else sort_column.desc()
    ) \
        .offset((page - 1) * 20) \
        .limit(20) \
        .all()

    return movies_data


def find_movie_categories(genres, tmdb_data):
    categories = []
    genre_ids = tmdb_data.get("genre_ids", None)
    if genre_ids:
        for genre in genres:
            if genre['id'] in genre_ids:
                categories.append(genre['name'])
    return categories


def add_movie_to_database(db, language, tmdb_data, categories):
    create_movie(
        db,
        Movie(
            id=tmdb_data["id"],
            original_language=tmdb_data["original_language"],
            language=language,
            original_title=tmdb_data["original_title"],
            overview=tmdb_data["overview"],
            popularity=tmdb_data.get("popularity", 0),
            poster_path=tmdb_data["poster_path"],
            backdrop_path=tmdb_data["backdrop_path"],
            release_date=tmdb_data.get("release_date"),
            category=categories,
            title=tmdb_data["title"],
            vote_average=tmdb_data.get("vote_average", 0),
            vote_count=tmdb_data.get("vote_count", 0),
        ),
    )
