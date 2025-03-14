import requests
import json
from api.redis_client import redis_client

from api.config import TMDB_API_BEARER_TOKEN


##################### TMDB #####################

def fetch_genres_movies_tmdb(language: str):
    url = f"https://api.themoviedb.org/3/genre/movie/list?language={language}"
    key_genres_movies = f"genres_movies:{language}"

    headers = {
        "accept": "application/json",
        "Authorization": f"Bearer {TMDB_API_BEARER_TOKEN}"
    }

    response = requests.get(url, headers=headers)
    if response.status_code != 200:
        return None

    genres = response.json()["genres"]

    redis_client.setex(key_genres_movies, 86400, json.dumps(genres))

    return genres

def fetch_popular_movies_tmdb(language: str, page: int):
    url = f"https://api.themoviedb.org/3/movie/popular?language={language}&page={page}"
    key_popular_movies = f"popular_movies:{page}:{language}"

    headers = {
        "accept": "application/json",
        "Authorization": f"Bearer {TMDB_API_BEARER_TOKEN}"
    }

    response = requests.get(url, headers=headers)
    if response.status_code != 200:
        return None

    movies_data = response.json()["results"]

    redis_client.setex(key_popular_movies, 86400, json.dumps(movies_data))

    return movies_data

def search_movies_tmdb(search: str, language: str, page: int):
    url = f"https://api.themoviedb.org/3/search/movie?query={search}&language={language}&page={page}"
    key_search = f"search:{search}:{language}:{page}"

    headers = {
        "accept": "application/json",
        "Authorization": f"Bearer {TMDB_API_BEARER_TOKEN}"
    }

    response = requests.get(url, headers=headers)
    if response.status_code != 200:
        return None

    movies_data = response.json()["results"]
    redis_client.setex(key_search, 86400, json.dumps(movies_data))

    return movies_data


def fetch_movie_detail_tmdb(movie_id: int, language: str):
    url = f"https://api.themoviedb.org/3/movie/{movie_id}?append_to_response=credits&language={language}"

    headers = {
        "accept": "application/json",
        "Authorization": f"Bearer {TMDB_API_BEARER_TOKEN}"
    }

    response = requests.get(url, headers=headers)
    if response.status_code != 200:
        return None

    detailed_movie_data = response.json()

    return detailed_movie_data


##################### ApiBay (ThePirateBay) #####################

def generate_magnet_link(info_hash, name):
    magnet_link = f"magnet:?xt=urn:btih:{info_hash}&dn={name.replace(' ', '+')}"
    return magnet_link

def get_magnet_link_piratebay(title, year):
    query = f"{title} {year}".replace(" ", "+")
    url = f"https://apibay.org/q.php?q={query}"

    response = requests.get(url)
    if response.status_code != 200:
        return None

    movies_metadata = response.json()
    if not movies_metadata:
        return None

    first_movie_metadata = movies_metadata[0]
    print(f"MOVIE MEDATA : {first_movie_metadata}")
    if int(first_movie_metadata['id']) == 0:
        return None
    
    info_hash = first_movie_metadata["info_hash"]
    name = first_movie_metadata["name"]

    # print(f"MOVIE MEDATA : {movies_metadata}")
    # print(f"NAME : {name}")

    return generate_magnet_link(info_hash, name)