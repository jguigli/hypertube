"""comments

Revision ID: d97dbe6d8074
Revises: f8543b7b4340
Create Date: 2025-02-24 14:30:13.701224

"""
from alembic import op
from sqlalchemy.sql import text


# revision identifiers, used by Alembic.
revision = 'd97dbe6d8074'
down_revision = 'f8543b7b4340'
branch_labels = None
depends_on = None


def upgrade() -> None:
    conn = op.get_bind()
    conn.execute(
        text(
            """
                CREATE TABLE comments (
                    id BIGSERIAL PRIMARY KEY,
                    movie_id INTEGER NOT NULL,
                    user_id INTEGER NOT NULL,
                    parent_id INTEGER,
                    content VARCHAR(500),
                    timestamp INTEGER,
                    FOREIGN KEY (parent_id) REFERENCES comments(id),
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
                DROP TABLE comments;
            """
        )
    )
