from cryptography.fernet import Fernet
from app.core.config import settings
import base64
import hashlib
from typing import Optional


def _get_fernet() -> Fernet:
    key = settings.ENCRYPTION_KEY
    valid_key = False
    if key and len(key) == 44:
        try:
            decoded = base64.urlsafe_b64decode(key.encode())
            if len(decoded) == 32:
                valid_key = True
        except Exception:
            valid_key = False
    if not valid_key:
        # Fallback reproducible 32-byte urlsafe base64 key from secret key
        secret = settings.SECRET_KEY or "scamshield-default-dev-secret-key-32b"
        digest = hashlib.sha256(secret.encode()).digest()
        key = base64.urlsafe_b64encode(digest).decode()
    return Fernet(key.encode())


def encrypt_field(plaintext: str) -> str:
    """Encrypts sensitive plaintext (such as user message snippets) at rest."""
    if not plaintext:
        return ""
    try:
        fernet = _get_fernet()
        return fernet.encrypt(plaintext.encode()).decode()
    except Exception:
        return plaintext


def decrypt_field(ciphertext: str) -> str:
    """Decrypts encrypted field content at rest."""
    if not ciphertext:
        return ""
    try:
        fernet = _get_fernet()
        return fernet.decrypt(ciphertext.encode()).decode()
    except Exception:
        return "[Decryption Error]"


def hash_indicator(value: Optional[str]) -> str:
    """Generates a salted SHA-256 hash for indicator lookups (privacy-preserving)."""
    if not value or not isinstance(value, str):
        return ""
    salt = (settings.SECRET_KEY or "scamshield-salt")[:16]
    return hashlib.sha256(f"{salt}:{value.strip().lower()}".encode()).hexdigest()
