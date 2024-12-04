import os
import jwt
from datetime import datetime, timedelta
from typing import Annotated
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError
from fastapi import (
    APIRouter,
    HTTPException,
    Depends,
    Query,
    Response,
    Header,
)
from fastapi_login import LoginManager, exceptions
from fastapi.security import OAuth2PasswordRequestForm
from src.utils.ApiResponse import Apiresponse
from src.utils.email import send_mail
from src.utils.otp_gen import generate_otp
from src.utils.email_temp import (
    create_otp_mail_template,
    create_verified_mail_template,
)
from src.model.req_body_model import signUpModel, verifyModel
from src.db.database import DatabaseManager
from src.utils.manage_cookies import manage_cookie

router = APIRouter(prefix="/v1", tags=["API"])

# jwt usable variables
jwt_algorithm = "HS256"
auth_secret = os.environ["AUTH_SECRET"]

db_manager = DatabaseManager()
loginManager = LoginManager(
    auth_secret, "/api/v1/login", use_cookie=True, use_header=True)

# this variable is being used globally for hashing and verifying as ph.hash or ph.verify
ph = PasswordHasher()


@router.get("/hs", status_code=200)
def healthCheck():
    return Apiresponse(200, message="Health checked successfully")


# route to check if username exist or not
@router.get("/checkUsername", status_code=200)
def checkUsername(username: str = Query(..., min_length=3, max_length=50)):
    isUsernameExist = db_manager.user_exists(username)
    if isUsernameExist:
        return Apiresponse(statusCode=409, message="username Already taken!")

    return Apiresponse(statusCode=200, message="Username Available")


# Route to register a new user
@router.post("/signUp", status_code=201)
def create_user_account(user: signUpModel):
    # Check if the email exists
    isEmailExist = db_manager.user_exists(email=user.email)
    if isEmailExist:
        raise HTTPException(
            status_code=409, detail="A user with this email ID is already registered.")

    # Common logic for sending OTP and inserting user data
    def send_otp_and_create_user(verified_status: bool):
        hashed_pass = ph.hash(user.password)
        code = generate_otp()
        otp_template = create_otp_mail_template(
            username=user.username, verifycode=code)
        email_sent = send_mail(
            email=user.email,
            username=user.username,
            verifycode=code,
            html_template=otp_template,
        )

        if email_sent:
            db_manager.insert_user_data(
                user.copy(update={"password": hashed_pass}),
                otp=code,
                verified=verified_status,
            )
            return Apiresponse(201, message="Account created successfully. An OTP has been sent to your email for verification.")
        else:
            raise HTTPException(
                status_code=500,
                detail="An unexpected error occurred while sending OTP mail!",
            )

    # User does not exist, so we create a new account
    return send_otp_and_create_user(verified_status=True)


# route to verify new users
@router.post("/verify", status_code=200)
def verify_user(req: verifyModel):
    result = db_manager.verify_otp(req.username)

    if req.otp != result["otp"]:
        raise HTTPException(status_code=403, detail="OTP is not valid!")

    if (datetime.now() - datetime.strptime(str(result["createdat"]), "%Y-%m-%d %H:%M:%S.%f")) >= timedelta(minutes=10):
        raise HTTPException(status_code=403, detail="OTP has expired")

    db_manager.verified_user(username=req.username)

    verify_mail = create_verified_mail_template(username=req.username)
    send_mail(username=req.username,
              email=result["email"], html_template=verify_mail, subject="Your Account is Now Verified")

    return Apiresponse(200, message="User verified successfully!")


# middleware for protected api's
@loginManager.user_loader()
def load_user(username: str):
    user = db_manager.user_exists(username)
    return user[0] if user else None


# Route to login verified users
@router.post("/login", status_code=200)
def login_user(
    response: Response,
    data: OAuth2PasswordRequestForm = Depends(),
):
    username = data.username
    password = data.password
    isUserExist = db_manager.user_exists(username=username)

    if not isUserExist:
        raise exceptions.InvalidCredentialsException

    hashedPass = db_manager.getPass(username)

    try:
        ph.verify(hashedPass, password)
    except VerifyMismatchError:
        raise exceptions.InvalidCredentialsException

    expiration_date = datetime.utcnow() + timedelta(days=7)

    access_token = jwt.encode(
        {"username": username, "exp": expiration_date}, auth_secret, jwt_algorithm)

    manage_cookie(response, "set", value=access_token)
    return Apiresponse(200, data={"accessToken": access_token, "username": username}, message="user loggedIn successfully")


# route to verify accessToken
@router.get("/verify_access_token", status_code=200)
def verify_access_token(res: Response, token: Annotated[str | None, Header()]):
    # Verifying access token from header
    if not token:
        raise HTTPException(status_code=401, detail="Access token is missing.")

    try:
        # Decode the token
        payload = jwt.decode(token, auth_secret, algorithms=[jwt_algorithm])
        username = payload.get("username")

        if username is None:
            raise HTTPException(
                status_code=401, detail="Invalid token: No username found.")

        # Load user from the database
        user = db_manager.user_exists(username)

        if not user:
            manage_cookie(res, "delete")
            raise HTTPException(status_code=401, detail="User not found.")

        return Apiresponse(statusCode=200, data={"username": username})

    except jwt.ExpiredSignatureError:
        manage_cookie(res, "delete")
        raise HTTPException(status_code=401, detail="Token has expired.")

    except jwt.PyJWTError as e:
        manage_cookie(res, "delete")
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")


@router.get("/logout", status_code=200)
def logoutUser(res: Response):
    manage_cookie(res, "delete")
    return Apiresponse(statusCode=200, message="Logged out successfully")


__all__ = ["router", "loginManager"]
