import json
import aiohttp
from api.redis_client import redis_client
import requests
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


async def fetch_top_rated_movies_tmdb(language: str):
    url = (
        "https://api.themoviedb.org/3/movie/top_rated?"
        f"language={language}&page=1"
    )
    key_top_rated_movies = f"top_rated_movies:{language}"

    headers = {
        "accept": "application/json",
        "Authorization": f"Bearer {TMDB_API_BEARER_TOKEN}"
    }

    async with aiohttp.ClientSession() as session:
        async with session.get(url, headers=headers) as response:
            if response.status != 200:
                return None
            response_json = await response.json()

    movies_data = response_json["results"][:9]
    redis_client.setex(key_top_rated_movies, 86400, json.dumps(movies_data))
    return movies_data


async def fetch_popular_movies_tmdb(language: str, page: int):
    url = (
        "https://api.themoviedb.org/3/movie/popular?"
        f"language={language}&page={page}"
    )
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
    url = (
        "https://api.themoviedb.org/3/search/movie?"
        f"query={search}&language={language}&page={page}"
    )
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


async def fetch_movie_tmdb(movie_id: int, language: str):
    url = (
        f"https://api.themoviedb.org/3/find/{movie_id}?"
        f"external_source=imdb_id&language={language}"
    )
    key_movie = f"movie:{movie_id}:{language}"

    headers = {
        "accept": "application/json",
        "Authorization": f"Bearer {TMDB_API_BEARER_TOKEN}"
    }

    async with aiohttp.ClientSession() as session:
        async with session.get(url, headers=headers) as response:
            if response.status != 200:
                return None
            response_json = await response.json()

    movie_data = response_json["movie_results"]
    if not movie_data:
        return None
    movie_data = movie_data[0]
    if not movie_data:
        return None
    redis_client.setex(key_movie, 86400, json.dumps(movie_data))
    return movie_data


# async def search_movie_omdb(search: str, page: int):
#     url = (
#         f"http://www.omdbapi.com/?apikey={OMDB_API_KEY}" +
#         f"&s={search}&type=movie&page={page}"
#     )
#     key_search = f"search_omdb:{search}:{page}"
#     async with aiohttp.ClientSession() as session:
#         async with session.get(url) as response:
#             if response.status != 200:
#                 print("Error fetching data from OMDB API")
#                 return None
#             response_json = await response.json()
#             if not response_json.get("Search"):
#                 print("No movies found")
#                 return None
#     json_movies_data = json.dumps(response_json["Search"])
#     if not json_movies_data:
#         print("No movies found in the response")
#         return None
#     redis_client.setex(key_search, 86400, json_movies_data)
#     return response_json["Search"]


# async def fetch_by_id_omdb(imdbID: str | None):
#     if not imdbID:
#         return None
#     url = (
#         f"http://www.omdbapi.com/?apikey={OMDB_API_KEY}" +
#         f"&i={imdbID}&type=movie&plot=full"
#     )
#     key_id = f"id_omdb:{imdbID}"
#     async with aiohttp.ClientSession() as session:
#         async with session.get(url) as response:
#             if response.status != 200:
#                 return None
#             response_json = await response.json()

#     movie_data = response_json
#     redis_client.setex(key_id, 86400, json.dumps(movie_data))
#     return movie_data


def search_yts_movies(query, page=1):
    url = "https://yts.mx/api/v2/list_movies.json"
    params = {
        "query_term": query,
        "page": page
    }
    response = requests.get(url, params=params)
    if response.status_code != 200:
        raise Exception(
            f"Failed to fetch data from YTS API: {response.status_code}"
        )
    data = response.json()
    return data["data"]["movies"] if (
        data["status"] == "ok" and data["data"].get("movies")
        ) else []


async def fetch_movie_detail_tmdb(movie_id: int, language: str):
    url = (
        f"https://api.themoviedb.org/3/movie/{movie_id}"
        f"?append_to_response=credits&language={language}"
    )
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
