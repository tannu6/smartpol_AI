import base64
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from django.conf import settings

def get_fernet():
    # Use the SECRET_KEY to derive a valid 32-byte base64-encoded key for Fernet
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=b"smartpol_salt",
        iterations=100000,
    )
    key = base64.urlsafe_b64encode(kdf.derive(settings.SECRET_KEY.encode('utf-8')))
    return Fernet(key)

def encrypt_text(text: str) -> str:
    if not text:
        return text
    f = get_fernet()
    # Return as string (Base64 string representing the encrypted bytes)
    return f.encrypt(text.encode('utf-8')).decode('utf-8')

def decrypt_text(encrypted_text: str) -> str:
    if not encrypted_text:
        return encrypted_text
    try:
        f = get_fernet()
        return f.decrypt(encrypted_text.encode('utf-8')).decode('utf-8')
    except Exception:
        # If decryption fails (e.g. it was stored as plain text before we added encryption)
        # return the raw text to be safe
        return encrypted_text
