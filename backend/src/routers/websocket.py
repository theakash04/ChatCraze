from src.services.websocket_connectionManager import ConnectionManager
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import json
from src.db.database import DatabaseManager

router = APIRouter(prefix="/ws", tags=["websocket"])

# ws implementation
manager = ConnectionManager()
db_manager = DatabaseManager()


@router.websocket("/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    await manager.connect(websocket, client_id)
    query = "UPDATE users SET isonline = true WHERE username = %s"
    db_manager.makeCustomQuery(query=query, param=(client_id,))
    try:
        while True:

            # data format of message
            """
            data format is {
                type: "message"
                from: "user1",
                to: "user2",
                message: "Hello there!"
            }
            """
            # data format if reciever is offline
            """
            {
                type: "offline",
                message: "user is offline"
            }
            """

            data = await websocket.receive_text()
            message = json.loads(data)
            receiver_name = message["to"]

            isOnline = db_manager.makeCustomQuery(
                query="SELECT isonline FROM users WHERE username = %s",
                param=(receiver_name,),
                update=False,
            )

            offline = {"type": "offline", "message": f"{receiver_name} is offline"}
            if isOnline['isonline']:
                await manager.send_personal_message(data, receiver_name)
            else:
                await manager.send_personal_message(json.dumps(offline), client_id)

    except WebSocketDisconnect:
        manager.disconnect(client_id)
        query = "UPDATE users SET isonline = FALSE WHERE username = %s"
        db_manager.makeCustomQuery(query=query, param=(client_id,))

__all__ = ["router", "manager"]
