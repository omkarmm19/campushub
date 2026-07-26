from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, status, Response, Cookie
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse
from app.schemas.auth import (
    LoginRequest,
    TokenResponse,
    RefreshTokenRequest,
    ForgotPasswordRequest,
    VerifyOTPRequest,
    ResetPasswordRequest,
)
from app.core.security import (
    get_password_hash,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token,
)
from app.core.email import generate_otp, send_otp_email

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    """
    Register a new student account with college credentials.
    """
    # Check if college email already exists
    existing_email = db.query(User).filter(User.college_email == user_in.college_email).first()
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Student with this college email already exists.",
        )

    # Check if registration number already exists
    existing_reg = db.query(User).filter(User.reg_number == user_in.reg_number).first()
    if existing_reg:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Student with this registration number already exists.",
        )

    # Hash password and store student record
    hashed_password = get_password_hash(user_in.password)
    user = User(
        name=user_in.name,
        reg_number=user_in.reg_number,
        college_email=user_in.college_email,
        phone=user_in.phone,
        block_number=user_in.block_number,
        room_number=user_in.room_number,
        password_hash=hashed_password,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login", response_model=TokenResponse)
def login(credentials: LoginRequest, response: Response, db: Session = Depends(get_db)):
    """
    Login student with college email and password. Returns Access & Refresh tokens.
    """
    user = db.query(User).filter(User.college_email == credentials.college_email).first()
    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect college email or password.",
        )

    if user.is_suspended:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been suspended by an admin.",
        )

    access_token = create_access_token(subject=user.id)
    refresh_token = create_refresh_token(subject=user.id)

    # Also set httpOnly cookie for refresh token security
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        max_age=7 * 24 * 3600,
        samesite="lax",
    )

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        user=user,
    )


@router.post("/refresh")
def refresh_token(
    request_data: RefreshTokenRequest = None,
    refresh_token_cookie: str = Cookie(None, alias="refresh_token"),
    db: Session = Depends(get_db),
):
    """
    Obtain a new access token using a valid refresh token.
    Accepts token from body or httpOnly cookie.
    """
    token_str = (request_data.refresh_token if request_data and request_data.refresh_token else refresh_token_cookie)
    if not token_str:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token required.",
        )

    payload = decode_token(token_str)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token.",
        )

    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user or user.is_suspended:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or suspended.",
        )

    new_access_token = create_access_token(subject=user.id)
    return {"access_token": new_access_token, "token_type": "bearer"}


@router.post("/forgot-password")
async def forgot_password(request_data: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """
    Generate 6-digit OTP and send email to student for password recovery.
    """
    user = db.query(User).filter(User.college_email == request_data.college_email).first()
    if not user:
        # Don't reveal user non-existence for security, return success message
        return {"message": "If the email is registered, an OTP has been sent."}

    otp = generate_otp(6)
    user.otp = otp
    user.otp_expires_at = datetime.now(timezone.utc) + timedelta(minutes=10)
    db.commit()

    # Send email in background / async
    await send_otp_email(user.college_email, otp)
    return {"message": "An OTP has been sent to your college email."}


@router.post("/verify-otp")
def verify_otp(request_data: VerifyOTPRequest, db: Session = Depends(get_db)):
    """
    Verify if the entered OTP is valid and not expired.
    """
    user = db.query(User).filter(User.college_email == request_data.college_email).first()
    if not user or user.otp != request_data.otp:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid OTP code.",
        )

    if not user.otp_expires_at or user.otp_expires_at < datetime.now(timezone.utc):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="OTP code has expired. Please request a new one.",
        )

    return {"message": "OTP verified successfully."}


@router.post("/reset-password")
def reset_password(request_data: ResetPasswordRequest, db: Session = Depends(get_db)):
    """
    Reset student password after OTP verification.
    """
    user = db.query(User).filter(User.college_email == request_data.college_email).first()
    if not user or user.otp != request_data.otp:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid OTP code.",
        )

    if not user.otp_expires_at or user.otp_expires_at < datetime.now(timezone.utc):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="OTP code has expired.",
        )

    user.password_hash = get_password_hash(request_data.new_password)
    user.otp = None
    user.otp_expires_at = None
    db.commit()

    return {"message": "Password reset successfully. You can now login with your new password."}


@router.post("/logout")
def logout(response: Response):
    """
    Logout student and clear refresh token cookie.
    """
    response.delete_cookie(key="refresh_token")
    return {"message": "Logged out successfully."}
