from fastapi import FastAPI
from pydantic import BaseModel
import uvicorn

app = FastAPI()

# Модель данных (JSON-схема)
class Message(BaseModel):
    text: str

# Endpoint POST
@app.post("/send/")
async def receive_message(message: Message):
    print(f"Получено сообщение: {message.text}")
    return {"status": "ok", "echo": message.text}

# Endpoint GET
@app.get("/ping/")
async def ping():
    return {"message": "pong"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)