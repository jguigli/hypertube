"""movies_watched

Revision ID: f8543b7b4340
Revises: 97c589d52131
Create Date: 2025-02-24 14:30:04.648902

"""
from alembic import op
from sqlalchemy.sql import text


# revision identifiers, used by Alembic.
revision = 'f8543b7b4340'
down_revision = '97c589d52131'
branch_labels = None
depends_on = None


def upgrade() -> None:
    conn = op.get_bind()
    conn.execute(
        text(
            """
                CREATE TABLE movies_watched (
                    id BIGSERIAL PRIMARY KEY,
                    movie_id INTEGER NOT NULL,
                    user_id INTEGER NOT NULL,
                    watched_at DATE DEFAULT CURRENT_DATE,
                    FOREIGN KEY (movie_id) REFERENCES movies(id),
                    FOREIGN KEY (user_id) REFERENCES users(id)
                );
            """
        )
    )


def downgrade() -> None:
    conn = op.get_bind()
    conn.execute(
        text(
            """
                DROP TABLE movies_watched;
            """
        )
    )
