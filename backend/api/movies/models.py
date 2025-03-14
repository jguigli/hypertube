from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Date, ARRAY
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import JSONB
from datetime import datetime, timedelta

from api.database import Base

class Movie(Base):
    __tablename__ = "movies"

    id = Column(Integer, primary_key=True, index=True)
    adult = Column(Boolean)
    original_language = Column(String(3))
    original_title = Column(String(64))
    overview = Column(String(1024))
    popularity = Column(Integer)
    poster_path = Column(String(64))
    backdrop_path = Column(String(64))
    release_date = Column(String(10))
    category = Column(ARRAY(String))
    title = Column(String(64))
    vote_average = Column(Integer)
    vote_count = Column(Integer)
    casting = Column(JSONB)
    crew = Column(JSONB)
    magnet_link = Column(String(300))
    file_path = Column(String(200))
    created_at = Column(Date, default=datetime.now)

    comments_association = relationship("Comment", back_populates="movie_association", cascade="all, delete-orphan")
    movies_watched_association = relationship("MovieWatched", cascade="all, delete-orphan")

    @property
    def comments(self):
        return [{"id": com.id, "user_id": com.user_id, "user_name": com.user_name, "content": com.content} for com in self.comments_association]



class MovieWatched(Base):
    __tablename__ = "movies_watched"

    id = Column(Integer, primary_key=True, index=True)
    movie_id = Column(Integer, ForeignKey("movies.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    watched_at = Column(Date, default=datetime.now)

    movie = relationship("Movie", back_populates="movies_watched_association")
    user = relationship("User", overlaps="movies_watched_association")