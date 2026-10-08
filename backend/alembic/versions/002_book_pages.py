"""book pages table

Revision ID: 002
Revises: 001
Create Date: 2026-06-20

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "002"
down_revision: Union[str, None] = "001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "book_pages",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("book_id", sa.Uuid(), nullable=False),
        sa.Column("page_number", sa.Integer(), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["book_id"], ["books.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("book_id", "page_number", name="uq_book_pages_book_page"),
    )
    op.create_index(op.f("ix_book_pages_book_id"), "book_pages", ["book_id"], unique=False)
    op.create_index(op.f("ix_book_pages_page_number"), "book_pages", ["page_number"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_book_pages_page_number"), table_name="book_pages")
    op.drop_index(op.f("ix_book_pages_book_id"), table_name="book_pages")
    op.drop_table("book_pages")
