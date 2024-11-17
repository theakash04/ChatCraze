from dotenv import load_dotenv
from fastapi import FastAPI
from src.db.databse import DatabaseManager
from fastapi.middleware.cors import CORSMiddleware
from src.routers.auth import router as auth_router
from src.routers.websocket import router as ws_router
from src.routers.users import router as users_router

app = FastAPI()

load_dotenv()
origins = ["http://localhost:3000"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

db_manager = DatabaseManager()


# connecting to db on start
@app.on_event("startup")
def create_db():
    db_manager.init_db()


app.include_router(auth_router)
app.include_router(ws_router)
app.include_router(users_router)
