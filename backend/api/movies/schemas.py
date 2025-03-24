from pydantic import BaseModel
from api.comments import schemas as comments_schemas
from enum import Enum


class MovieDisplay(BaseModel):
    id: int
    title: str
    release_date: str
    vote_average: float
    category: list[str] | None
    poster_path: str | None
    is_watched: bool

    class Config:
        from_attributes = True


class Cast(BaseModel):
    name: str
    role: str


class MovieInfo(BaseModel):
    id: int
    adult: bool
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
    category: list[str] | None
    casting: list[Cast] | None
    crew: list[Cast] | None
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
    filter_options: FilterOption
    sort_options: SortOption


class VoteAverage(BaseModel):
    min: float
    max: float


class ReleaseDate(BaseModel):
    min: int
    max: int


class MovieInformations(BaseModel):
    vote_average: VoteAverage
    release_date: ReleaseDate
    genres: list[str]
