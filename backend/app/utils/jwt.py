from jose import JWTError, jwt
from datetime import datetime, timedelta
from app.exceptions.auth import InvalidTokenException


class JWTManager:
    def __init__(self, secret_key: str, algorithm: str, expire_hours: int):
        self.secret_key = secret_key
        self.algorithm = algorithm
        self.expire_hours = expire_hours

    def create_token(self, subject: str, role: str, store_id: int) -> str:
        """Create JWT token"""
        expire = datetime.utcnow() + timedelta(hours=self.expire_hours)
        payload = {
            "sub": subject,
            "role": role,
            "store_id": store_id,
            "exp": expire
        }
        return jwt.encode(payload, self.secret_key, algorithm=self.algorithm)

    def verify_token(self, token: str) -> dict:
        """Verify JWT token and return payload"""
        try:
            payload = jwt.decode(
                token, self.secret_key, algorithms=[self.algorithm]
            )
            return payload
        except JWTError as e:
            raise InvalidTokenException({"error": str(e)})
