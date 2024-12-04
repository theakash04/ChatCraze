from fastapi import Response
import os

isProd = os.getenv("PROD", "False").lower()

def manage_cookie(
    response: Response,
    action: str,
    key: str = "accessToken",
    value: str = "",
    secure: bool = isProd,
    samesite: str = "None" if isProd else "Lax",
    httponly: bool = True,
    path: str = "/"
):
    """
    Utility to manage cookies (set or delete).

    Args:
    - response (Response): FastAPI response object.
    - action (str): "set" to set a cookie or "delete" to delete a cookie.
    - key (str): Cookie name. Default is "accessToken".
    - value (str): Value for the cookie if action is "set".
    - secure (bool): Use secure cookies. Default is True.
    - samesite (str): SameSite policy. Default is "none".
    - httponly (bool): HTTP-only cookie flag. Default is True.
    - path (str): Path for the cookie. Default is "/".
    """
    if action == "set":
        response.set_cookie(
            key=key,
            value=value,
            secure=secure,
            samesite=samesite,
            httponly=httponly,
            path=path,
        )
    elif action == "delete":
        response.delete_cookie(
            key=key,
            secure=secure,
            samesite=samesite,
            path=path,
        )

__all__ = ["manage_cookie"]
