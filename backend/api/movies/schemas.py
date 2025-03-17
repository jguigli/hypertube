from pydantic import BaseModel
from api.comments import schemas as comments_schemas


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
