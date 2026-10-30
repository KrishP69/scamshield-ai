from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional, Union
import hashlib
import hmac
import os
import secrets
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

try:
    import jwt
except ImportError:
    from jose import jwt

try:
    import bcrypt

    def verify_password(plain_password: str, hashed_password: str) -> bool:
        try:
            return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
        except Exception:
            return False

    def get_password_hash(password: str) -> str:
        salt = bcrypt.gensalt()
        return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")

except ImportError:
    # Secure PBKDF2-HMAC-SHA256 fallback if bcrypt not installed
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        try:
            if ":" not in hashed_password:
                return False
            salt, stored_hash = hashed_password.split(":", 1)
            computed = hashlib.pbkdf2_hmac("sha256", plain_password.encode(), bytes.fromhex(salt), 100000).hex()
            return hmac.compare_digest(stored_hash, computed)
        except Exception:
            return False

    def get_password_hash(password: str) -> str:
        salt = secrets.token_bytes(16)
        key = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, 100000)
        return f"{salt.hex()}:{key.hex()}"

from app.core.config import settings

bearer_security = HTTPBearer(auto_error=False)


def create_access_token(subject: Union[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode: Dict[str, Any] = {"exp": expire, "sub": str(subject), "type": "access"}
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    if isinstance(encoded_jwt, bytes):
        encoded_jwt = encoded_jwt.decode("utf-8")
    return encoded_jwt


def create_refresh_token(subject: Union[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode: Dict[str, Any] = {"exp": expire, "sub": str(subject), "type": "refresh"}
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    if isinstance(encoded_jwt, bytes):
        encoded_jwt = encoded_jwt.decode("utf-8")
    return encoded_jwt


def decode_token(token: str) -> Optional[Dict[str, Any]]:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        return payload
    except Exception:
        return None


async def get_current_user_optional(credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_security)) -> Optional[Dict[str, Any]]:
    if not credentials:
        return None
    token = credentials.credentials
    payload = decode_token(token)
    if not payload or payload.get("type") != "access":
        return None
    return payload


async def get_current_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_security)) -> Dict[str, Any]:
    if not credentials:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required")
    payload = decode_token(credentials.credentials)
    if not payload or payload.get("type") != "access":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired access token")
    return payload


async def require_admin(credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_security)) -> Optional[Dict[str, Any]]:
    if settings.DEBUG and not credentials:
        return {"sub": "dev_admin", "role": "admin"}
    if not credentials:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required")
    payload = decode_token(credentials.credentials)
    if not payload or payload.get("type") != "access":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired access token")
    if payload.get("role") != "admin" and not settings.DEBUG:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin permissions required")
    return payload
