from datetime import datetime


class DateTimeUtils:
    @staticmethod
    def utcnow() -> datetime:
        """Get current UTC datetime"""
        return datetime.utcnow()

    @staticmethod
    def to_iso8601(dt: datetime) -> str:
        """Convert datetime to ISO 8601 string"""
        return dt.isoformat() + "Z"

    @staticmethod
    def from_iso8601(s: str) -> datetime:
        """Parse ISO 8601 string to datetime"""
        if s.endswith("Z"):
            s = s[:-1]
        return datetime.fromisoformat(s)
