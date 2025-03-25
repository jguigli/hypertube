from sqlalchemy import (
    Boolean, Column, ForeignKey, Integer, String, Date, ARRAY, Text
)
from sqlalchemy.orm import relationship
from datetime import datetime
from api.database import Base


class Movie(Base):
    __tablename__ = "movies"

    id = Column(Integer, primary_key=True, index=True)
    original_language = Column(String(3))
    language = Column(String(3))
    original_title = Column(String(512))
    overview = Column(String(1024))
    popularity = Column(Integer)
    poster_path = Column(String(64))
    backdrop_path = Column(String(64))
    release_date = Column(String(10))
    category = Column(ARRAY(Text))
    title = Column(String(512))
    vote_average = Column(Integer)
    vote_count = Column(Integer)

    magnet_link = Column(String(300))
    file_path = Column(String(200))
    is_download = Column(Boolean, default=False)
    is_convert = Column(Boolean, default=False)
    created_at = Column(Date, default=datetime.now)

    comments_association = relationship(
        "Comment",
        back_populates="movie_association",
        cascade="all, delete-orphan"
    )
    movies_watched_association = relationship(
        "MovieWatched",
        cascade="all, "
        "delete-orphan"
    )

    @property
    def comments(self):
        return [
            {
                "id": com.id,
                "user_id": com.user_id,
                "user_name": com.user_name,
                "parent_id": com.parent_id,
                "content": com.content,
                "timestamp": com.timestamp,
                "replies": com.replies
            } for com in self.comments_association if com.parent_id is None
        ]


class MovieWatched(Base):
    __tablename__ = "movies_watched"

    id = Column(Integer, primary_key=True, index=True)
    movie_id = Column(
        Integer, ForeignKey("movies.id", ondelete="CASCADE"), nullable=False
    )
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    watched_at = Column(Date, default=datetime.now)

    movie = relationship("Movie", back_populates="movies_watched_association")
    user = relationship("User", overlaps="movies_watched_association")
