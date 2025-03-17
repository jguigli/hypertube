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
    key_detailed_movie = f"detailed_movie:{movie_id}:{language}"

    headers = {
        "accept": "application/json",
        "Authorization": f"Bearer {TMDB_API_BEARER_TOKEN}"
    }

    response = requests.get(url, headers=headers)
    if response.status_code != 200:
        return None

    detailed_movie_data = response.json()
    redis_client.setex(key_detailed_movie, 86400, json.dumps(detailed_movie_data))

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
    
    if int(movies_metadata[0]['id']) == 0:
        return None
    
    word_to_check = title.split()
    word_to_check.append(str(year))

    for index in range(len(movies_metadata)):
        movie_metadata = movies_metadata[index]
        info_hash = movie_metadata["info_hash"]
        name = movie_metadata["name"]

        if all(word in name for word in word_to_check):
            break

    print(f"MOVIE MEDATA : {movie_metadata}")

    return generate_magnet_link(info_hash, name)