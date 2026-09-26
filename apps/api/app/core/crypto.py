from cryptography.fernet import Fernet
from app.core.config import settings
import base64
import hashlib


def _get_fernet() -> Fernet:
    key = settings.ENCRYPTION_KEY
    if not key or len(key) != 44:
        # Fallback reproducible 32-byte urlsafe base64 key from secret key
        digest = hashlib.sha256(settings.SECRET_KEY.encode()).digest()
        key = base64.urlsafe_b64encode(digest).decode()
    return Fernet(key.encode())


def encrypt_field(plaintext: str) -> str:
    """Encrypts sensitive plaintext (such as user message snippets) at rest."""
    if not plaintext:
        return ""
    fernet = _get_fernet()
    return fernet.encrypt(plaintext.encode()).decode()


def decrypt_field(ciphertext: str) -> str:
    """Decrypts encrypted field content at rest."""
    if not ciphertext:
        return ""
    try:
        fernet = _get_fernet()
        return fernet.decrypt(ciphertext.encode()).decode()
    except Exception:
        return "[Decryption Error]"


def hash_indicator(value: str) -> str:
    """Generates a salted SHA-256 hash for indicator lookups (privacy-preserving)."""
    salt = settings.SECRET_KEY[:16]
    return hashlib.sha256(f"{salt}:{value.strip().lower()}".encode()).hexdigest()
