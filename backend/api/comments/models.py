from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Date
from sqlalchemy.orm import relationship
from datetime import datetime, timedelta

from api.database import Base

class Comment(Base):
    __tablename__ = "comments"

    id = Column(Integer, primary_key=True, index=True)
    movie_id = Column(Integer, ForeignKey("movies.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    parent_id = Column(Integer, ForeignKey("comments.id"), nullable=True, default=None)
    content = Column(String(500))

    timestamp = Column(Integer, nullable=False)

    movie_association = relationship("Movie", back_populates="comments_association")
    user_association = relationship("User")
    parent_comment = relationship("Comment", back_populates="children_replies", remote_side=[id])
    children_replies = relationship("Comment", back_populates="parent_comment")


    @property
    def user_name(self):
        return self.user_association.user_name
    
    @property
    def replies(self):
        return [{"id": com.id, "user_id": com.user_id, "user_name": com.user_name, "parent_id": com.parent_id, "content": com.content, "timestamp":com.timestamp, "replies": com.replies} for com in self.children_replies]