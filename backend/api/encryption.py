import base64
import os
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from django.conf import settings

# A fixed per-deployment salt derived from SECRET_KEY.
# This is acceptable because SECRET_KEY itself is the secret,
# and we derive a deterministic Fernet key for symmetric encryption.
# For per-record salts, migrate to EncryptedField with stored IVs.
_SALT = b"smartpol_v2_" + settings.SECRET_KEY[:16].encode('utf-8', errors='replace')

def _get_fernet():
    """Derive a stable Fernet key from Django SECRET_KEY using PBKDF2-SHA256."""
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=_SALT,
        iterations=260000,  # OWASP 2023 recommended minimum
    )
    key = base64.urlsafe_b64encode(kdf.derive(settings.SECRET_KEY.encode('utf-8')))
    return Fernet(key)


def encrypt_text(text: str) -> str:
    """Encrypt a UTF-8 string and return a base64-encoded ciphertext string."""
    if not text:
        return text
    return _get_fernet().encrypt(text.encode('utf-8')).decode('utf-8')


def decrypt_text(encrypted_text: str) -> str:
    """Decrypt a Fernet-encrypted string. Returns raw text on failure (legacy fallback)."""
    if not encrypted_text:
        return encrypted_text
    try:
        return _get_fernet().decrypt(encrypted_text.encode('utf-8')).decode('utf-8')
    except Exception:
        # Graceful fallback: pre-encryption data stored as plain text
        return encrypted_text
