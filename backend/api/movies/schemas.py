from pydantic import BaseModel
from typing import List
from api.comments import schemas as comments_schemas


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
