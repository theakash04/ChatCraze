import os
from dotenv import load_dotenv
from fastapi import (
    FastAPI,
    Depends,
    Response,
)
from src.db.databse import DatabaseManager
from fastapi.middleware.cors import CORSMiddleware
from src.services.websocket_connectionManager import ConnectionManager
from src.routers.auth import router as auth_router

app = FastAPI()

load_dotenv()
origins = ["http://localhost", "http://localhost:3000"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

db_manager = DatabaseManager()


# secret = os.environ["auth_secret"]




# connecting to db on start
@app.on_event("startup")
def create_db():
    db_manager.init_db()


app.include_router(auth_router)





# will delete the code below after migrating it to their respective folder











# # socket.io implementation
# manager = ConnectionManager()


# @app.websocket("/ws/{client_id}")
# async def websocket_endpoint(websocket: WebSocket, client_id: str):
#     await manager.connect(websocket)
#     print(websocket)
#     try:
#         while True:
#             data = await websocket.receive_text()
#             await manager.send_personal_message(f"you wrote: {data}", websocket)
#             await manager.brodcast(f"client #{client_id} syas: {data}")
#     except WebSocketDisconnect:
#         manager.disconnect(websocket)
#         await manager.brodcast(f"client #{client_id} left the chat")



