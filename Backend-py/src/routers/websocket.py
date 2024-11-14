from src.services.websocket_connectionManager import ConnectionManager
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Response
import json

router = APIRouter(prefix="/ws", tags=["websocket"])

# ws implementation
manager = ConnectionManager()


@router.websocket("/{client_id}")
async def websocket_endpoint(response: Response,
                             websocket: WebSocket,
                             client_id: str):
    await manager.connect(websocket, client_id)
    print("connected", websocket, client_id)
    try:
        while True:
            # this is a setup for brodacsting to all
            '''
            data format is {
                from: "user1",
                to: "user2",
                message: "Hello there!"
            }
            '''

            data = await websocket.receive_text()
            message = json.loads(data)
            receiver_name = message['to']

            # await manager.broadcast(data)

            # logic for one-to-one chat
            await manager.send_personal_message(data, receiver_name)

    except WebSocketDisconnect:
        manager.disconnect(client_id)
        print("user diconnected", client_id)
        # await manager.broadcast(f"Client #{client_id} left the chat")


__all__ = ["router", "manager"]
