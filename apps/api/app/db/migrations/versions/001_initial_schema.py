"""001_initial_schema

Revision ID: 001_initial_schema
Revises: 
Create Date: 2026-09-26 19:15:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "001_initial_schema"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Users table
    op.create_table(
        "users",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("password_hash", sa.String(length=255), nullable=False),
        sa.Column("role", sa.String(length=50), nullable=False, server_default="user"),
        sa.Column("store_history", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)

    # Scans table
    op.create_table(
        "scans",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("user_id", sa.String(length=36), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("input_type", sa.String(length=50), nullable=False),
        sa.Column("platform", sa.String(length=50), nullable=False),
        sa.Column("risk_score", sa.Integer(), nullable=False),
        sa.Column("level", sa.String(length=20), nullable=False),
        sa.Column("scam_type", sa.String(length=100), nullable=True),
        sa.Column("passport", sa.JSON(), nullable=False),
        sa.Column("saved", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("raw_text_encrypted", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_scans_created_at", "scans", ["created_at"])

    # Findings table
    op.create_table(
        "findings",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("scan_id", sa.String(length=36), sa.ForeignKey("scans.id", ondelete="CASCADE"), nullable=False),
        sa.Column("module", sa.String(length=50), nullable=False),
        sa.Column("score", sa.Float(), nullable=False),
        sa.Column("confidence", sa.Float(), nullable=False),
        sa.Column("source", sa.String(length=50), nullable=False),
        sa.Column("evidence", sa.JSON(), nullable=False),
    )
    op.create_index("ix_findings_scan_id", "findings", ["scan_id"])

    # Indicators table
    op.create_table(
        "indicators",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("scan_id", sa.String(length=36), sa.ForeignKey("scans.id", ondelete="CASCADE"), nullable=False),
        sa.Column("kind", sa.String(length=50), nullable=False),
        sa.Column("value_hash", sa.String(length=64), nullable=False),
        sa.Column("value_display", sa.String(length=255), nullable=False),
    )
    op.create_index("ix_indicators_scan_id", "indicators", ["scan_id"])
    op.create_index("ix_indicators_value_hash", "indicators", ["value_hash"])

    # Uploads table
    op.create_table(
        "uploads",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("scan_id", sa.String(length=36), sa.ForeignKey("scans.id", ondelete="CASCADE"), nullable=False),
        sa.Column("sha256", sa.String(length=64), nullable=False),
        sa.Column("mime", sa.String(length=100), nullable=False),
        sa.Column("size", sa.Integer(), nullable=False),
        sa.Column("delete_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_uploads_sha256", "uploads", ["sha256"])

    # Reputation table
    op.create_table(
        "reputation",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("kind", sa.String(length=50), nullable=False),
        sa.Column("value_hash", sa.String(length=64), nullable=False),
        sa.Column("report_count", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("status", sa.String(length=50), nullable=False, server_default="suspicious"),
        sa.Column("last_seen", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_reputation_value_hash", "reputation", ["value_hash"], unique=True)

    # Community reports table
    op.create_table(
        "community_reports",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("user_id", sa.String(length=36), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("reputation_id", sa.String(length=36), sa.ForeignKey("reputation.id", ondelete="CASCADE"), nullable=False),
        sa.Column("note", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )

    # Reports table (shareable links)
    op.create_table(
        "reports",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("scan_id", sa.String(length=36), sa.ForeignKey("scans.id", ondelete="CASCADE"), nullable=False),
        sa.Column("share_token", sa.String(length=64), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_reports_share_token", "reports", ["share_token"], unique=True)

    # Label queue table
    op.create_table(
        "label_queue",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("scan_id", sa.String(length=36), sa.ForeignKey("scans.id", ondelete="CASCADE"), nullable=False),
        sa.Column("proposed_label", sa.String(length=100), nullable=False),
        sa.Column("reviewer_label", sa.String(length=100), nullable=True),
        sa.Column("reviewed_at", sa.DateTime(timezone=True), nullable=True),
    )

    # API keys table
    op.create_table(
        "api_keys",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("user_id", sa.String(length=36), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("key_hash", sa.String(length=64), nullable=False),
        sa.Column("rate_limit", sa.Integer(), nullable=False, server_default="60"),
    )
    op.create_index("ix_api_keys_key_hash", "api_keys", ["key_hash"], unique=True)


def downgrade() -> None:
    op.drop_table("api_keys")
    op.drop_table("label_queue")
    op.drop_table("reports")
    op.drop_table("community_reports")
    op.drop_table("reputation")
    op.drop_table("uploads")
    op.drop_table("indicators")
    op.drop_table("findings")
    op.drop_table("scans")
    op.drop_table("users")
