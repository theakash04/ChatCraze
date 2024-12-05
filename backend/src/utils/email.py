import os
import resend
from dotenv import load_dotenv

load_dotenv()


resend.api_key = os.environ["RESEND_API"]


def send_mail(
    email: str,
    username: str,
    html_template: str,
    verifycode: str = None,
    subject: str = "Account Verification",
):

    params: resend.Emails.SendParams = {
        "from": "chatcraze <chatcraze@akashtwt.tech>",
        "to": [email],
        "subject": subject,
        "html": html_template,
    }
    email: resend.Email = resend.Emails.send(params)
    return email


__all__ = ["send_mail"]
