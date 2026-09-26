import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.types import JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.session import Base

# Universal JSON type that handles SQLite JSON and Postgres JSONB
JsonType = JSON().with_variant(JSONB, "postgresql")


def get_utc_now() -> datetime:
    return datetime.now(timezone.utc)


def gen_uuid_str() -> str:
    return str(uuid.uuid4())


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid_str)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(50), default="user", nullable=False)
    store_history: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=get_utc_now)

    scans: Mapped[List["Scan"]] = relationship("Scan", back_populates="user", cascade="all, delete-orphan")
    api_keys: Mapped[List["ApiKey"]] = relationship("ApiKey", back_populates="user", cascade="all, delete-orphan")


class Scan(Base):
    __tablename__ = "scans"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid_str)
    user_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    input_type: Mapped[str] = mapped_column(String(50), default="text", nullable=False)
    platform: Mapped[str] = mapped_column(String(50), default="unknown", nullable=False)
    risk_score: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    level: Mapped[str] = mapped_column(String(20), default="LOW", nullable=False)
    scam_type: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    passport: Mapped[Dict[str, Any]] = mapped_column(JsonType, nullable=False)
    saved: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    # Field-level encrypted message snippet if user opted-in to store history
    raw_text_encrypted: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=get_utc_now, index=True)

    user: Mapped[Optional["User"]] = relationship("User", back_populates="scans")
    findings: Mapped[List["FindingModel"]] = relationship("FindingModel", back_populates="scan", cascade="all, delete-orphan")
    indicators: Mapped[List["Indicator"]] = relationship("Indicator", back_populates="scan", cascade="all, delete-orphan")
    uploads: Mapped[List["Upload"]] = relationship("Upload", back_populates="scan", cascade="all, delete-orphan")
    reports: Mapped[List["Report"]] = relationship("Report", back_populates="scan", cascade="all, delete-orphan")


class FindingModel(Base):
    __tablename__ = "findings"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid_str)
    scan_id: Mapped[str] = mapped_column(String(36), ForeignKey("scans.id", ondelete="CASCADE"), nullable=False, index=True)
    module: Mapped[str] = mapped_column(String(50), nullable=False)
    score: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    confidence: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    source: Mapped[str] = mapped_column(String(50), default="model", nullable=False)
    evidence: Mapped[List[Dict[str, Any]]] = mapped_column(JsonType, default=list, nullable=False)

    scan: Mapped["Scan"] = relationship("Scan", back_populates="findings")


class Indicator(Base):
    __tablename__ = "indicators"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid_str)
    scan_id: Mapped[str] = mapped_column(String(36), ForeignKey("scans.id", ondelete="CASCADE"), nullable=False, index=True)
    kind: Mapped[str] = mapped_column(String(50), nullable=False)  # url, phone, wallet, username, hash
    value_hash: Mapped[str] = mapped_column(String(64), index=True, nullable=False)  # Salted SHA-256
    value_display: Mapped[str] = mapped_column(String(255), nullable=False)  # Truncated or defanged display value

    scan: Mapped["Scan"] = relationship("Scan", back_populates="indicators")


class Upload(Base):
    __tablename__ = "uploads"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid_str)
    scan_id: Mapped[str] = mapped_column(String(36), ForeignKey("scans.id", ondelete="CASCADE"), nullable=False)
    sha256: Mapped[str] = mapped_column(String(64), index=True, nullable=False)
    mime: Mapped[str] = mapped_column(String(100), nullable=False)
    size: Mapped[int] = mapped_column(Integer, nullable=False)
    delete_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    scan: Mapped["Scan"] = relationship("Scan", back_populates="uploads")


class Reputation(Base):
    __tablename__ = "reputation"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid_str)
    kind: Mapped[str] = mapped_column(String(50), nullable=False)  # url, phone, wallet, username
    value_hash: Mapped[str] = mapped_column(String(64), unique=True, index=True, nullable=False)
    report_count: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="suspicious", nullable=False)
    last_seen: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=get_utc_now)

    community_reports: Mapped[List["CommunityReport"]] = relationship("CommunityReport", back_populates="reputation")


class CommunityReport(Base):
    __tablename__ = "community_reports"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid_str)
    user_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    reputation_id: Mapped[str] = mapped_column(String(36), ForeignKey("reputation.id", ondelete="CASCADE"), nullable=False)
    note: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=get_utc_now)

    reputation: Mapped["Reputation"] = relationship("Reputation", back_populates="community_reports")


class Report(Base):
    __tablename__ = "reports"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid_str)
    scan_id: Mapped[str] = mapped_column(String(36), ForeignKey("scans.id", ondelete="CASCADE"), nullable=False)
    share_token: Mapped[str] = mapped_column(String(64), unique=True, index=True, nullable=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    scan: Mapped["Scan"] = relationship("Scan", back_populates="reports")


class LabelQueue(Base):
    __tablename__ = "label_queue"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid_str)
    scan_id: Mapped[str] = mapped_column(String(36), ForeignKey("scans.id", ondelete="CASCADE"), nullable=False)
    proposed_label: Mapped[str] = mapped_column(String(100), nullable=False)
    reviewer_label: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    reviewed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)


class ApiKey(Base):
    __tablename__ = "api_keys"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid_str)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    key_hash: Mapped[str] = mapped_column(String(64), unique=True, index=True, nullable=False)
    rate_limit: Mapped[int] = mapped_column(Integer, default=60, nullable=False)

    user: Mapped["User"] = relationship("User", back_populates="api_keys")
