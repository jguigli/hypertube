"""users

Revision ID: 841b2dd6ebff
Revises:
Create Date: 2025-02-24 14:25:26.328384

"""
from alembic import op
from sqlalchemy.sql import text


# revision identifiers, used by Alembic.
revision = '841b2dd6ebff'
down_revision = None
branch_labels = None
depends_on = None

# class User(Base):
#     __tablename__ = "users"

#     id = Column(Integer, primary_key=True, index=True)
#     email = Column(String(320), unique=True, index=True)
#     user_name = Column(String(64), unique=True, index=True)
#     first_name = Column(String(64))
#     last_name = Column(String(64))
#     profile_picture_path = Column(String(255))
#     language = Column(String(5), default="en")
#     movies_watched_association = relationship("MovieWatched")
#     # hashed_password = Column(String(60))  # Moved in the AuthProvider model
#     # is_resetting_password = Column(Boolean, default=False)  # Unused ?
#     auth_providers = relationship("AuthProvider", back_populates="user")
#     created_at = Column(Date, default=datetime.now)
#     updated_at = Column(Date, default=datetime.now, onupdate=datetime.now)
#     @property
#     def access_token(self):
#         access_token_expires = timedelta(
#             minutes=security.ACCESS_TOKEN_EXPIRE_MINUTES
#         )
#         return security.create_access_token(
#             data={"user_id": self.id}, expires_delta=access_token_expires
#         )
#     @property
#     def token_type(self):
#         return 'Bearer'
#     @property
#     def profile_picture(self):
#         return FileResponse(self.profile_picture_path)

def upgrade() -> None:
    conn = op.get_bind()
    conn.execute(
        text(
            """
                CREATE TABLE users (
                    id SERIAL PRIMARY KEY,
                    email VARCHAR(320) UNIQUE NOT NULL,
                    user_name VARCHAR(64) UNIQUE NOT NULL,
                    first_name VARCHAR(64),
                    last_name VARCHAR(64),
                    profile_picture_path VARCHAR(255),
                    language VARCHAR(5) DEFAULT 'en',
                    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
                    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
                );
            """
        )
    )
    conn.execute(
        text(
            """
                CREATE INDEX idx_email_users ON users (email);
                CREATE INDEX idx_username_users ON users (user_name);
            """
        )
    )


def downgrade() -> None:
    conn = op.get_bind()
    conn.execute(
        text(
            """
                DROP INDEX idx_username_users;
                DROP INDEX idx_email_users;
            """
        )
    )
    conn.execute(
        text(
            """
                DROP TABLE users;
            """
        )
    )
