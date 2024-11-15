from src.services.websocket_connectionManager import ConnectionManager
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import json
from src.db.databse import DatabaseManager

router = APIRouter(prefix="/ws", tags=["websocket"])

# ws implementation
manager = ConnectionManager()
db_manager = DatabaseManager()


@router.websocket("/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    await manager.connect(websocket, client_id)
    print("connected", websocket, client_id)
    query = "update users set isonline = true where username = ?"
    db_manager.makeCustomQuery(query=query, param=(client_id,))
    try:
        while True:
            # this is a setup for brodacsting to all
            '''
            data format is {
                type: "message"
                from: "user1",
                to: "user2",
                message: "Hello there!"
            }
            '''
            # data format if reciever is offline
            '''
            {
                type: "offline",
                message: "user is offline"
            }
            '''

            data = await websocket.receive_text()
            message = json.loads(data)
            receiver_name = message['to']

            isOnline = db_manager.makeCustomQuery(
                query="SELECT isOnline FROM users WHERE username = ?",
                param=(receiver_name,),
                update=False,
            )

            offline = {
                "type": "offline",
                "message": f"{receiver_name} is offline"
            }

            if isOnline[0]:
                print("yo2", isOnline)
                await manager.send_personal_message(data, receiver_name)
            else:
                print("yo")
                await manager.send_personal_message(
                    json.dumps(offline),
                    client_id
                )

    except WebSocketDisconnect:
        manager.disconnect(client_id)
        query = "UPDATE users SET isOnline = FALSE WHERE username = ?"
        db_manager.makeCustomQuery(query=query, param=(client_id,))
        print("user diconnected", client_id)
        # await manager.broadcast(f"Client #{client_id} left the chat")


__all__ = ["router", "manager"]
