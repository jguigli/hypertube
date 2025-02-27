from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Date
from sqlalchemy.orm import relationship
from datetime import datetime, timedelta

from api.database import Base

class Comment(Base):
    __tablename__ = "comments"

    id = Column(Integer, primary_key=True, index=True)
    movie_id = Column(Integer, ForeignKey("movies.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    content = Column(String(500))

    created_at = Column(Date, default=datetime.now)

    movie_association = relationship("Movie")
    user_association = relationship("User")

    @property
    def user_name(self):
        return self.user_association.user_name