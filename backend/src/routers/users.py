from src.db.databse import DatabaseManager
from fastapi import APIRouter
from src.utils.ApiResponse import Apiresponse

router = APIRouter(
    prefix="/api/v1",
    tags=["API"],
)

db_manager = DatabaseManager()


@router.get("/getUsers", status_code=200)
def getUsers():
    users = db_manager.getAllUsers()
    return Apiresponse(statusCode=200, data=users, message="Got users successfully!")


__all__ = ["router"]
