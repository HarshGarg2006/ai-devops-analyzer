import os
import asyncio
import aiosmtplib

from email.message import EmailMessage
from dotenv import load_dotenv

load_dotenv()


async def test_email():
    email = EmailMessage()

    email["From"] = os.getenv("SMTP_EMAIL")
    email["To"] = os.getenv("SMTP_EMAIL")
    email["Subject"] = "LogAI SMTP Connection Test"

    email.set_content(
        "Congratulations! Your LogAI Gmail SMTP configuration is working."
    )

    try:
        await aiosmtplib.send(
            email,
            hostname=os.getenv("SMTP_HOST"),
            port=int(os.getenv("SMTP_PORT", "587")),
            username=os.getenv("SMTP_EMAIL"),
            password=os.getenv("SMTP_PASSWORD"),
            start_tls=True,
            timeout=20
        )

        print("SUCCESS: Test email sent!")

    except Exception as error:
        print("SMTP TEST FAILED:", type(error).__name__)
        print("Check SMTP configuration and Gmail App Password.")


if __name__ == "__main__":
    asyncio.run(test_email())