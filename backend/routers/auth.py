import os
import secrets

from datetime import datetime, timedelta, timezone
from email.message import EmailMessage

import aiosmtplib

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from dependencies import get_current_user
from database import get_db
from models import User, EmailOTP
from schemas import (
    RegisterRequest,
    LoginRequest,
    VerifyEmailRequest,
    ResendOTPRequest,
    TokenResponse,
    UserResponse,
    MessageResponse,
)
from services.security import (
    hash_password,
    verify_password,
    create_access_token,
)

router = APIRouter()

OTP_EXPIRY_MINUTES = 5
OTP_RESEND_SECONDS = 60
OTP_MAX_ATTEMPTS = 5


def generate_otp():
    return f"{secrets.randbelow(900000) + 100000}"


async def send_otp_email(email: str, otp: str):
    smtp_host = os.getenv("SMTP_HOST")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_email = os.getenv("SMTP_EMAIL")
    smtp_password = os.getenv("SMTP_PASSWORD")

    if not all([smtp_host, smtp_email, smtp_password]):
        raise RuntimeError("SMTP configuration is incomplete")

    message = EmailMessage()
    message["From"] = smtp_email
    message["To"] = email
    message["Subject"] = "LogAI Email Verification"

    message.set_content(
        f"""
Hello,

Your LogAI email verification OTP is: {otp}

This OTP will expire in 5 minutes.

If you did not request this verification, please ignore this email.

LogAI Security Team
"""
    )

    await aiosmtplib.send(
        message,
        hostname=smtp_host,
        port=smtp_port,
        username=smtp_email,
        password=smtp_password,
        start_tls=True,
        timeout=20,
    )


def create_otp_record(db: Session, user_id: int, otp: str):
    now = datetime.now(timezone.utc)

    existing_otp = (
        db.query(EmailOTP)
        .filter(EmailOTP.user_id == user_id)
        .first()
    )

    if existing_otp:
        existing_otp.otp_hash = hash_password(otp)
        existing_otp.expires_at = now + timedelta(
            minutes=OTP_EXPIRY_MINUTES
        )
        existing_otp.attempts = 0
        existing_otp.last_sent_at = now
    else:
        db.add(
            EmailOTP(
                user_id=user_id,
                otp_hash=hash_password(otp),
                expires_at=now + timedelta(minutes=OTP_EXPIRY_MINUTES),
                attempts=0,
                last_sent_at=now,
            )
        )

    db.commit()


async def deliver_otp(db: Session, user: User, otp: str):
    try:
        await send_otp_email(user.email, otp)
    except Exception:
        db.query(EmailOTP).filter(
            EmailOTP.user_id == user.id
        ).delete()
        db.commit()

        raise HTTPException(
            status_code=503,
            detail="Unable to send verification email. Please try again."
        )


@router.post(
    "/register",
    response_model=MessageResponse,
    status_code=201
)
async def register(
    data: RegisterRequest,
    db: Session = Depends(get_db)
):
    email = str(data.email).lower().strip()

    existing = db.query(User).filter(User.email == email).first()

    if existing:
        raise HTTPException(
            status_code=409,
            detail="Email already registered. Use resend OTP if not verified."
        )

    user = User(
        full_name=data.full_name.strip(),
        email=email,
        password_hash=hash_password(data.password),
        role="VIEWER",
        is_verified=False,
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    otp = generate_otp()
    create_otp_record(db, user.id, otp)

    await deliver_otp(db, user, otp)

    return {
        "message": "Registration successful. Check your email for the OTP."
    }


@router.post(
    "/verify-email",
    response_model=MessageResponse
)
def verify_email(
    data: VerifyEmailRequest,
    db: Session = Depends(get_db)
):
    email = str(data.email).lower().strip()

    user = db.query(User).filter(User.email == email).first()

    if not user:
        raise HTTPException(
            status_code=400,
            detail="Invalid email or OTP"
        )

    if user.is_verified:
        return {"message": "Email is already verified."}

    otp_record = (
        db.query(EmailOTP)
        .filter(EmailOTP.user_id == user.id)
        .first()
    )

    if not otp_record:
        raise HTTPException(
            status_code=400,
            detail="OTP not found. Please request a new OTP."
        )

    if otp_record.attempts >= OTP_MAX_ATTEMPTS:
        raise HTTPException(
            status_code=429,
            detail="Maximum OTP attempts reached. Request a new OTP."
        )

    now = datetime.now(timezone.utc)

    if otp_record.expires_at <= now:
        db.delete(otp_record)
        db.commit()

        raise HTTPException(
            status_code=400,
            detail="OTP expired. Please request a new OTP."
        )

    if not verify_password(data.otp, otp_record.otp_hash):
        otp_record.attempts += 1
        db.commit()

        raise HTTPException(
            status_code=400,
            detail="Invalid OTP"
        )

    user.is_verified = True
    db.delete(otp_record)
    db.commit()

    return {"message": "Email verified successfully. You can now log in."}


@router.post(
    "/resend-otp",
    response_model=MessageResponse
)
async def resend_otp(
    data: ResendOTPRequest,
    db: Session = Depends(get_db)
):
    email = str(data.email).lower().strip()

    user = db.query(User).filter(User.email == email).first()

    # Avoid revealing whether an email has an account.
    if not user or user.is_verified:
        return {
            "message": "If an unverified account exists, a new OTP will be sent."
        }

    existing_otp = (
        db.query(EmailOTP)
        .filter(EmailOTP.user_id == user.id)
        .first()
    )

    now = datetime.now(timezone.utc)

    if existing_otp:
        allowed_at = existing_otp.last_sent_at + timedelta(
            seconds=OTP_RESEND_SECONDS
        )

        if now < allowed_at:
            remaining = int((allowed_at - now).total_seconds()) + 1

            raise HTTPException(
                status_code=429,
                detail=f"Please wait {remaining} seconds before requesting another OTP."
            )

    otp = generate_otp()
    create_otp_record(db, user.id, otp)

    await deliver_otp(db, user, otp)

    return {
        "message": "If an unverified account exists, a new OTP will be sent."
    }


@router.post("/login", response_model=TokenResponse)
def login(
    data: LoginRequest,
    db: Session = Depends(get_db)
):
    email = str(data.email).lower().strip()

    user = db.query(User).filter(User.email == email).first()

    if not user or not user.password_hash:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    if not verify_password(data.password, user.password_hash):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    if not user.is_verified:
        raise HTTPException(
            status_code=403,
            detail="Please verify your email before logging in"
        )

    token = create_access_token(user.id)

    return {
        "access_token": token,
        "token_type": "bearer"
    }


@router.get("/me", response_model=UserResponse)
def get_me(
    current_user: User = Depends(get_current_user)
):
    return current_user