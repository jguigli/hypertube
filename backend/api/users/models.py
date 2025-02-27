from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Date
from sqlalchemy.orm import relationship
from datetime import datetime, timedelta

from fastapi.responses import FileResponse

from api.login import security
from api.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(320), unique=True, index=True)
    user_name = Column(String(64), unique=True, index=True)
    first_name = Column(String(64))
    last_name = Column(String(64))
    hashed_password = Column(String(60))
    profile_picture_path = Column(String(255))
    is_resetting_password = Column(Boolean, default=False)

    created_at = Column(Date, default=datetime.now)

    movies_watched_association = relationship("MovieWatched")

    @property
    def access_token(self):
        access_token_expires = timedelta(minutes=security.ACCESS_TOKEN_EXPIRE_MINUTES)
        return security.create_access_token(
            data={"user_name": str(self.user_name)}, expires_delta=access_token_expires
        )

    @property
    def token_type(self):
        return 'Bearer'
    
    @property
    def profile_picture(self):
        return FileResponse(self.profile_picture_path)