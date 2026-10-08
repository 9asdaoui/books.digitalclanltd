"""initial schema

Revision ID: 001
Revises:
Create Date: 2026-05-29

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("hashed_password", sa.String(length=255), nullable=False),
        sa.Column("full_name", sa.String(length=255), nullable=True),
        sa.Column("role", sa.String(), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.Column("metadata_extra", postgresql.JSONB(astext_type=sa.Text()), server_default="{}", nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_users_email"), "users", ["email"], unique=True)

    op.create_table(
        "genres",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("slug", sa.String(length=100), nullable=False),
        sa.Column("metadata_extra", postgresql.JSONB(astext_type=sa.Text()), server_default="{}", nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_genres_slug"), "genres", ["slug"], unique=True)

    op.create_table(
        "books",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("title", sa.String(length=500), nullable=False),
        sa.Column("author_id", sa.Uuid(), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("genre_id", sa.Uuid(), nullable=True),
        sa.Column("cover_url", sa.String(length=1000), nullable=True),
        sa.Column("file_encrypted_path", sa.String(length=1000), nullable=True),
        sa.Column("total_pages", sa.Integer(), nullable=False),
        sa.Column("free_page_limit", sa.Integer(), nullable=False),
        sa.Column("is_published", sa.Boolean(), nullable=False),
        sa.Column("language", sa.String(length=10), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.Column("metadata_extra", postgresql.JSONB(astext_type=sa.Text()), server_default="{}", nullable=False),
        sa.ForeignKeyConstraint(["author_id"], ["users.id"]),
        sa.ForeignKeyConstraint(["genre_id"], ["genres.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_books_author_id"), "books", ["author_id"], unique=False)
    op.create_index(op.f("ix_books_genre_id"), "books", ["genre_id"], unique=False)

    op.create_table(
        "subscriptions",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("user_id", sa.Uuid(), nullable=False),
        sa.Column("plan_id", sa.String(length=100), nullable=False),
        sa.Column("status", sa.String(), nullable=False),
        sa.Column("paypal_sub_id", sa.String(length=255), nullable=True),
        sa.Column("current_period_end", sa.DateTime(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.Column("metadata_extra", postgresql.JSONB(astext_type=sa.Text()), server_default="{}", nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_subscriptions_user_id"), "subscriptions", ["user_id"], unique=False)

    op.create_table(
        "reading_progress",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("user_id", sa.Uuid(), nullable=False),
        sa.Column("book_id", sa.Uuid(), nullable=False),
        sa.Column("current_page", sa.Integer(), nullable=False),
        sa.Column("percent_complete", sa.Float(), nullable=False),
        sa.Column("bookmarks", postgresql.JSONB(astext_type=sa.Text()), server_default="[]", nullable=False),
        sa.Column("last_read_at", sa.DateTime(), nullable=False),
        sa.Column("metadata_extra", postgresql.JSONB(astext_type=sa.Text()), server_default="{}", nullable=False),
        sa.ForeignKeyConstraint(["book_id"], ["books.id"]),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_reading_progress_book_id"), "reading_progress", ["book_id"], unique=False)
    op.create_index(op.f("ix_reading_progress_user_id"), "reading_progress", ["user_id"], unique=False)
    op.create_index("ix_reading_progress_user_book", "reading_progress", ["user_id", "book_id"], unique=True)

    op.create_table(
        "audit_logs",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("user_id", sa.Uuid(), nullable=True),
        sa.Column("action", sa.String(length=100), nullable=False),
        sa.Column("timestamp", sa.DateTime(), nullable=False),
        sa.Column("ip_address", sa.String(length=45), nullable=True),
        sa.Column("metadata_extra", postgresql.JSONB(astext_type=sa.Text()), server_default="{}", nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_audit_logs_action"), "audit_logs", ["action"], unique=False)
    op.create_index(op.f("ix_audit_logs_timestamp"), "audit_logs", ["timestamp"], unique=False)
    op.create_index(op.f("ix_audit_logs_user_id"), "audit_logs", ["user_id"], unique=False)


def downgrade() -> None:
    op.drop_table("audit_logs")
    op.drop_index("ix_reading_progress_user_book", table_name="reading_progress")
    op.drop_table("reading_progress")
    op.drop_table("subscriptions")
    op.drop_table("books")
    op.drop_table("genres")
    op.drop_table("users")
