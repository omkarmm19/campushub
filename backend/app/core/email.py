import random
import string
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
from pydantic import EmailStr
from app.core.config import settings

# FastAPI-Mail connection configuration
mail_config = ConnectionConfig(
    MAIL_USERNAME=settings.MAIL_USERNAME,
    MAIL_PASSWORD=settings.MAIL_PASSWORD,
    MAIL_FROM=settings.MAIL_FROM,
    MAIL_PORT=settings.MAIL_PORT,
    MAIL_SERVER=settings.MAIL_SERVER,
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True,
)


def generate_otp(length: int = 6) -> str:
    """Generate a random numeric OTP string of given length."""
    return "".join(random.choices(string.digits, k=length))


async def send_otp_email(email_to: str, otp: str) -> bool:
    """
    Send password reset OTP code to student's college email.
    """
    html_content = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #4F46E5; text-align: center;">CampusHub Password Reset</h2>
        <p>Hello,</p>
        <p>You requested a password reset for your CampusHub account. Your 6-digit verification code (OTP) is:</p>
        <div style="background-color: #F3F4F6; padding: 16px; text-align: center; border-radius: 6px; font-size: 28px; font-weight: bold; letter-spacing: 4px; color: #111827; margin: 20px 0;">
            {otp}
        </div>
        <p>This code is valid for 10 minutes. If you did not request this, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;" />
        <p style="font-size: 12px; color: #6B7280; text-align: center;">CampusHub — Students Helping Students</p>
    </div>
    """

    message = MessageSchema(
        subject="CampusHub — Password Reset OTP",
        recipients=[email_to],
        body=html_content,
        subtype=MessageType.html,
    )

    try:
        fm = FastMail(mail_config)
        await fm.send_message(message)
        return True
    except Exception as e:
        print(f"Error sending email to {email_to}: {e}")
        return False
