from sqlalchemy import Column, Integer, String, Date, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from datetime import datetime, timedelta

from fastapi.responses import FileResponse

from api.login import security
from api.database import Base


class AuthProvider(Base):
    __tablename__ = "auth_providers"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    user = relationship("User", back_populates="auth_providers")

    provider = Column(String(64))
    provider_id = Column(String(320), default=None, nullable=True, index=True)
    email = Column(String(320), index=True)
    hashed_password = Column(String(60), default=None, nullable=True)

    created_at = Column(Date, default=datetime.now)
    updated_at = Column(Date, default=datetime.now, onupdate=datetime.now)

    __table_args__ = (UniqueConstraint("user_id", "provider", name="uq_user_provider"),)
