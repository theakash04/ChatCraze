import bcrypt
import os
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Depends, Response
from src.utils.ApiResponse import Apiresponse
from src.db.databse import DatabaseManager
from src.model.req_body_model import signUpModel, verifyModel
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from src.utils.email import send_otp_mail
from src.utils.otp_gen import generate_otp
from datetime import datetime, timedelta
from fastapi_login import LoginManager, exceptions


app = FastAPI()
db_manager = DatabaseManager()

load_dotenv()

secret = os.environ["auth_secret"]

loginManager = LoginManager(secret, "/api/login", use_cookie=True, use_header=True)



# connecting to db on start
@app.on_event("startup")
def create_db():
    db_manager.init_db()


# checking the api health
@app.get("/", status_code=200)
def healthCheck(user=Depends(loginManager)):
    return Apiresponse(200, message="Health checked successfully")


# creating new user
@app.post("/api/sign-up", status_code=201)
def create_user_account(user: signUpModel):
    # Check if the username exists
    isUsernameExist = db_manager.user_exists(username=user.username)
    if isUsernameExist:
        raise HTTPException(status_code=409, detail="Username already exists.")

    # Check if the email exists
    isEmailExist = db_manager.user_exists(email=user.email)
    if isEmailExist:
        raise HTTPException(status_code=409, detail="Email already exists.")

    # Common logic for sending OTP and inserting user data
    def send_otp_and_create_user(verified_status: bool):
        hashed_pass = bcrypt.hashpw(user.password.encode("utf-8"), bcrypt.gensalt(10))
        code = generate_otp()
        email_sent = send_otp_mail(
            email=user.email, username=user.username, verifycode=code
        )

        if email_sent:
            db_manager.insert_user_data(
                user.copy(update={"password": hashed_pass.decode("utf-8")}),
                otp=code,
                verified=verified_status,
            )
            return Apiresponse(
                201,
                data=user.copy(update={"password": ""}),
                message="User created successfully and OTP sent for verification.",
            )
        else:
            raise HTTPException(
                status_code=500,
                detail="An unexpected error occurred while sending OTP mail!",
            )

    # User does not exist, so we create a new account
    return send_otp_and_create_user(verified_status=True)


# verifying user otp
@app.post("/api/verify", status_code=200)
def verify_user(req: verifyModel):
    result = db_manager.verify_otp(req.username)
    date_format = "%Y-%m-%d %H:%M:%S.%f"
    createdAt = datetime.strptime(result["created_at"], date_format)
    current_time = datetime.now()

    # Validate the OTP
    if req.code != result["otp"]:
        raise HTTPException(status_code=403, detail="OTP is not valid!")

    # Check OTP expiration
    if current_time - createdAt >= timedelta(minutes=10):
        raise HTTPException(status_code=403, detail="OTP has expired")

    # set user as verfied in db
    db_manager.verified_user(username=req.username)

    return Apiresponse(200, message="user verified succefully!")

# middleware for protected api's
@loginManager.user_loader()
def load_user(username:str):
    user = db_manager.user_exists(username)
    return user[0] if user else None

# login users 
@app.post("/api/login", status_code=200)
def login_user(response:Response, data: OAuth2PasswordRequestForm = Depends()):
    username = data.username
    password = data.password
    isUserExist = db_manager.user_exists(username = username)

    if not isUserExist:
        raise exceptions.InvalidCredentialsException

    db_password = db_manager.getPass(username)
    hashedPass = db_password[0].encode('utf-8')

    if not bcrypt.checkpw(password.encode('utf-8'), hashedPass):
        raise exceptions.InvalidCredentialsException

    access_token = loginManager.create_access_token(data={"sub": username})
    
    loginManager.set_cookie(response=response,token=access_token)
    
    return Apiresponse(
        200, data={"access_token": access_token}, message="user loggedIn successfully "
    )


