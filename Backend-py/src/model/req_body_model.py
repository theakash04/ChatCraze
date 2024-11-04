from pydantic import BaseModel, EmailStr


class signUpModel(BaseModel):
    username: str
    email: EmailStr
    password: str


class loginModel(BaseModel):
    username: str
    password: str


class verifyModel(BaseModel):
    username: str
    code: str


__all__ = ["signUpModel", "loginModel", "verifyModel"]
