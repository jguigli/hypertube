"""authprovider

Revision ID: 782c75218b2f
Revises: d97dbe6d8074
Create Date: 2025-03-04 19:49:13.860873

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '782c75218b2f'
down_revision = 'd97dbe6d8074'
branch_labels = None
depends_on = None


def upgrade() -> None:
    conn = op.get_bind()
    conn.execute(
        sa.text(
            """
                CREATE TABLE auth_providers (
                    id SERIAL PRIMARY KEY,
                    user_id INTEGER NOT NULL,
                    provider VARCHAR(64) NOT NULL,
                    provider_id VARCHAR(320),
                    user_name VARCHAR(64),
                    email VARCHAR(320),
                    hashed_password VARCHAR(60),
                    is_resetting_password BOOLEAN DEFAULT FALSE,
                    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
                    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
                    FOREIGN KEY (user_id) REFERENCES users (id)
                );
            """
        )
    )
    conn.execute(
        sa.text(
            """
                CREATE UNIQUE INDEX uq_user_provider ON auth_providers (user_id, provider);
            """
        )
    )


def downgrade() -> None:
    conn = op.get_bind()
    conn.execute(
        sa.text(
            """
                DROP TABLE auth_providers;
            """
        )
    )
