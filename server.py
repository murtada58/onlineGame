import asyncio
from asyncio.windows_events import NULL
import json
import logging
import ssl
import websockets

SERVER_IP = "176.58.109.37" # set to "localhost" or your servers ip if you want to host your own server
PORT = 6080

logging.basicConfig()

USERS = {}

async def update():
    while True:
        websockets.broadcast(
            USERS,
            json.dumps({ 
                "type": "update",
                "players": { USERS[player]["name"]: USERS[player]["paths"] for player in USERS if USERS[player]["name"] != NULL and USERS[player]["paths"] }
            })
        )
        for player in USERS:
            USERS[player]["paths"] = []
        await asyncio.sleep(0.5)

async def game(websocket, path):
    try:
        print("new user connected")
        USERS[websocket] = {"name": NULL, "paths": []}
        async for message in websocket:
            data = json.loads(message)
            if data["action"] == "move":
                USERS[websocket]["name"] = data["name"]
                USERS[websocket]["paths"] += data["paths"]
            else:
                logging.error(f"unsupported event: {data}")
    finally:
        websockets.broadcast(USERS, json.dumps({"type": "leave", "name": USERS[websocket]["name"]}))
        del USERS[websocket]
        print("user removed")

ssl_context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
cert = "/etc/letsencrypt/live/websockettictactoe.co.uk/fullchain.pem"
key = "/etc/letsencrypt/live/websockettictactoe.co.uk/privkey.pem"
ssl_context.load_cert_chain(cert, keyfile=key)

async def main():
    async with websockets.serve(game, SERVER_IP, PORT, ssl=ssl_context):
        await update()
        await asyncio.Future()  # run forever
    

if __name__ == "__main__":
    asyncio.run(main())