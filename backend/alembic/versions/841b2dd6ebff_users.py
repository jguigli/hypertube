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
