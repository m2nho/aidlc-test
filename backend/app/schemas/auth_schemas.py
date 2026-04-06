from pydantic import BaseModel


class CustomerLoginRequest(BaseModel):
    table_number: int
    password: str


class AdminLoginRequest(BaseModel):
    username: str
    password: str


class LoginResponse(BaseModel):
    message: str


class LogoutResponse(BaseModel):
    message: str
