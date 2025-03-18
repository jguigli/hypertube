from pydantic import BaseModel
from api.comments import schemas as comments_schemas
from enum import Enum


# class MovieInfo(BaseModel):
#     id: int
#     original_language: str
#     original_title: str
#     overview: str
#     popularity: float
#     poster_path: str
#     backdrop_path: str
#     release_date: str
#     title: str
#     vote_average: float
#     vote_count: int
#     is_watched: bool

#     class Config:
#         from_attributes = True


class MovieDisplay(BaseModel):
    id: int
    title: str
    release_date: str
    vote_average: float
    poster_path: str | None
    is_watched: bool

    class Config:
        from_attributes = True


class MovieInfo(BaseModel):
    id: int
    original_language: str
    original_title: str
    overview: str
    popularity: float
    poster_path: str | None
    backdrop_path: str | None
    release_date: str
    title: str
    vote_average: float
    vote_count: int
    comments: list[comments_schemas.Comment]

    class Config:
        from_attributes = True
        # orm_mode = True


class SortType(Enum):
    NONE = "none"
    NAME = "name"
    PRODUCTION_YEAR = "production_year"
    IMDB_RATING = "imdb_rating"


class SortOption(BaseModel):
    type: SortType
    ascending: bool


class FilterOption(BaseModel):
    production_year_low: int
    production_year_high: int
    imdb_rating_low: float
    imdb_rating_high: float


class PopularMovieBody(BaseModel):
    page: int
    language: str
    filter_options: FilterOption
    sort_options: SortOption


class SearchMovieBody(BaseModel):
    search: str
    language: str
    page: int
    sort_options: SortOption
