import json
import aiohttp
from api.redis_client import redis_client

from api.config import TMDB_API_BEARER_TOKEN


# #################### TMDB #####################


async def fetch_genres_movies_tmdb(language: str):
    url = f"https://api.themoviedb.org/3/genre/movie/list?language={language}"
    key_genres_movies = f"genres_movies:{language}"

    headers = {
        "accept": "application/json",
        "Authorization": f"Bearer {TMDB_API_BEARER_TOKEN}"
    }

    async with aiohttp.ClientSession() as session:
        async with session.get(url, headers=headers) as response:
            if response.status != 200:
                return None
            response_json = await response.json()

    genres = response_json["genres"]
    redis_client.setex(key_genres_movies, 86400, json.dumps(genres))
    return genres


async def fetch_popular_movies_tmdb(language: str, page: int):
    url = f"https://api.themoviedb.org/3/movie/popular?language={language}&page={page}"
    key_popular_movies = f"popular_movies:{page}:{language}"

    headers = {
        "accept": "application/json",
        "Authorization": f"Bearer {TMDB_API_BEARER_TOKEN}"
    }

    async with aiohttp.ClientSession() as session:
        async with session.get(url, headers=headers) as response:
            if response.status != 200:
                return None
            response_json = await response.json()

    movies_data = response_json["results"]
    redis_client.setex(key_popular_movies, 86400, json.dumps(movies_data))
    return movies_data


async def search_movies_tmdb(search: str, language: str, page: int):
    url = f"https://api.themoviedb.org/3/search/movie?query={search}&language={language}&page={page}"
    key_search = f"search:{search}:{language}:{page}"

    headers = {
        "accept": "application/json",
        "Authorization": f"Bearer {TMDB_API_BEARER_TOKEN}"
    }

    async with aiohttp.ClientSession() as session:
        async with session.get(url, headers=headers) as response:
            if response.status != 200:
                return None
            response_json = await response.json()

    movies_data = response_json["results"]
    redis_client.setex(key_search, 86400, json.dumps(movies_data))
    return movies_data

# async def search_movies_omdb(search: str, language: str, page: int):
#     url = f"http://www.omdbapi.com/?t=tt3896198&apikey=ace95878"
#     key_search = f"search:{search}:{language}:{page}"

#     headers = {
#         "accept": "application/json",
#         "Authorization": f"Bearer {TMDB_API_BEARER_TOKEN}"
#     }

#     async with aiohttp.ClientSession() as session:
#         async with session.get(url, headers=headers) as response:
#             if response.status != 200:
#                 return None
#             response_json = await response.json()

#     movies_data = response_json["results"]
#     redis_client.setex(key_search, 86400, json.dumps(movies_data))
#     return movies_data


async def fetch_movie_detail_tmdb(movie_id: int, language: str):
    url = f"https://api.themoviedb.org/3/movie/{movie_id}?append_to_response=credits&language={language}"
    key_detailed_movie = f"detailed_movie:{movie_id}:{language}"

    headers = {
        "accept": "application/json",
        "Authorization": f"Bearer {TMDB_API_BEARER_TOKEN}"
    }

    async with aiohttp.ClientSession() as session:
        async with session.get(url, headers=headers) as response:
            if response.status != 200:
                return None
            response_json = await response.json()

    detailed_movie_data = response_json
    redis_client.setex(
        key_detailed_movie, 86400, json.dumps(detailed_movie_data)
    )
    return detailed_movie_data


# #################### ApiBay (ThePirateBay) #####################


async def get_magnet_link_piratebay(title, year):
    query = f"{title} {year}".replace(" ", "+")
    url = f"https://apibay.org/q.php?q={query}"

    async with aiohttp.ClientSession() as session:
        async with session.get(url) as response:
            if response.status != 200:
                return None

            movies_metadata = await response.json()
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
            print(f"MOVIE MEDATA : {movie_metadata}")
            return (
                f"magnet:?xt=urn:btih:{info_hash}&dn={name.replace(' ', '+')}"
            )

    return None
