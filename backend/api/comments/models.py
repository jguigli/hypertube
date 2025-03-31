from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Date
from sqlalchemy.orm import relationship
from datetime import datetime, timedelta

from api.database import Base

class Comment(Base):
    __tablename__ = "comments"

    id = Column(Integer, primary_key=True, index=True)
    movie_id = Column(Integer, ForeignKey("movies.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    parent_id = Column(Integer, ForeignKey("comments.id", ondelete="CASCADE"), nullable=True, default=None)
    content = Column(String(500))

    timestamp = Column(Integer, nullable=False)

    movie_association = relationship("Movie", back_populates="comments_association")
    user_association = relationship("User", lazy="joined")
    parent_comment = relationship("Comment", back_populates="children_replies", remote_side=[id])
    children_replies = relationship(
        "Comment",
        back_populates="parent_comment",
        cascade="all, delete-orphan"
    )


    @property
    def user_name(self):
        return self.user_association.user_name
    
    @property
    def avatarUrl(self):
        return f"/users/{self.user_id}/picture"
    
    # @property
    # def avatarUrl(self):
    #     with open(self.user_association.profile_picture_path, "rb") as f:
    #         return f.read()

    @property
    def replies(self):
        return [
            {
                "id": com.id, 
                "user_id": com.user_id, 
                "user_name": com.user_name, 
                "parent_id": com.parent_id, 
                "content": com.content, 
                "avatarUrl": com.avatarUrl, 
                "timestamp":com.timestamp,
                "replies": com.replies
            }
            for com in self.children_replies
        ]