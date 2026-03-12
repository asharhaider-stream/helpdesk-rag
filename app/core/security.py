from passlib.context import CryptContext
from jose import jwt
from datetime import datetime, timedelta
from app.core.config import settings
import hashlib

SECRET_KEY = settings.secret_key
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

pwd_context = CryptContext(schemes=["bcrypt"])

def hash_password(password: str) -> str:
    password_hash = hashlib.sha256(password.encode()).hexdigest()
    return pwd_context.hash(password_hash)

def verify_password(plain: str, hashed: str) -> bool:
    plain_hash = hashlib.sha256(plain.encode()).hexdigest()
    return pwd_context.verify(plain_hash, hashed)

def create_jwt(data: dict) -> str:
    payload = data.copy()
    payload["exp"] = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def decode_jwt(token: str) -> dict:
    return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])