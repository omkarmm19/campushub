from pydantic import BaseModel, EmailStr
from app.schemas.user import UserResponse


class LoginRequest(BaseModel):
    college_email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserResponse


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class ForgotPasswordRequest(BaseModel):
    college_email: EmailStr


class VerifyOTPRequest(BaseModel):
    college_email: EmailStr
    otp: str


class ResetPasswordRequest(BaseModel):
    college_email: EmailStr
    otp: str
    new_password: str
