"""movies

Revision ID: 97c589d52131
Revises: 841b2dd6ebff
Create Date: 2025-02-24 14:29:46.668998

"""
from alembic import op
from sqlalchemy.sql import text


# revision identifiers, used by Alembic.
revision = '97c589d52131'
down_revision = '841b2dd6ebff'
branch_labels = None
depends_on = None


def upgrade() -> None:
    conn = op.get_bind()
    conn.execute(
        text(
            """
                CREATE TABLE IF NOT EXISTS movies (
                    id INTEGER PRIMARY KEY,
                    imdb_id VARCHAR(50),
                    original_language VARCHAR(3),
                    language VARCHAR(3),
                    original_title VARCHAR(512),
                    overview VARCHAR(1024),
                    popularity INTEGER,
                    poster_path VARCHAR(64),
                    backdrop_path VARCHAR(64),
                    release_date VARCHAR(10),
                    category TEXT ARRAY,
                    title VARCHAR(512),
                    runtime INTEGER,
                    vote_average INTEGER,
                    vote_count INTEGER,
                    magnet_link VARCHAR(300),
                    file_path VARCHAR(200),
                    is_download BOOLEAN DEFAULT FALSE,
                    is_convert BOOLEAN DEFAULT FALSE,
                    created_at DATE DEFAULT CURRENT_DATE
                );
            """
        )
    )


def downgrade() -> None:
    conn = op.get_bind()
    conn.execute(
        text(
            """
                DROP TABLE movies;
            """
        )
    )
