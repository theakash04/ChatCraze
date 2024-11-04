import os
import resend
from dotenv import load_dotenv
from typing import Dict

load_dotenv()


resend.api_key = os.environ["resend_api"]


def send_mail(
    email: str,
    username: str,
    html_template: str,
    verifycode: str = None,
) -> Dict:
    
    params: resend.Emails.SendParams = {
        "from": "chatcraze <chatcraze@akashtwt.tech>",
        "to": [email],
        "subject": "Verify your account now!",
        "html": html_template
    }
    email: resend.Email = resend.Emails.send(params)
    return email


__all__ = ["send_otp_mail"]
