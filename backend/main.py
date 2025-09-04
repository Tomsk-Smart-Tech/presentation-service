import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import tritonclient.http as httpclient
import numpy as np
import json
import logging
import os
from dotenv import load_dotenv
import requests


load_dotenv()# переменные из .env файла в окружение
TRITON_URL = os.getenv("TRITON_URL", "localhost:8000")
APP_PORT = int(os.getenv("APP_PORT", 8001))
MODEL_NAME = "mixtral"


logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


#Triton
try:
    triton_client = httpclient.InferenceServerClient(url=TRITON_URL)
    if not triton_client.is_server_live():
         raise ConnectionError("Triton server is not live")
    logger.info(f"Успешное подключение к Triton Inference Server по адресу: {TRITON_URL}")
except Exception as e:
    logger.error(f"Не удалось подключиться к Triton Inference Server: {e}")
    triton_client = None


#база пользователей
try:
    base_dir = os.path.dirname(os.path.abspath(__file__))
    users_file_path = os.path.join(base_dir, "users.json")
    with open(users_file_path, "r", encoding="utf-8") as f:
        users_db = json.load(f)
    logger.info(f"База данных пользователей успешно загружена. Найдено пользователей: {len(users_db)}")
except FileNotFoundError:
    logger.error("Файл users.json не найден! Создайте его для работы авторизации.")
    users_db = []
except json.JSONDecodeError:
    logger.error("Ошибка чтения users.json! Проверьте синтаксис файла.")
    users_db = []


app = FastAPI(
    title="API для генерации презентаций",
    description="Прокси-сервер для модели на Triton Inference Server.",
    version="1.0.0"
)


origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"], 
)


class UserPrompt(BaseModel):
    prompt: str

class UserLogin(BaseModel):
    username: str
    password: str

class LoginResponse(BaseModel):
    role: str


# def get_prediction_from_triton(prompt_text: str) -> dict:
#     """
#     Отправляет текстовый промпт в модель на сервере Triton и возвращает результат в виде словаря.
#     """
#     if not triton_client:
#         raise ConnectionError("Клиент Triton не инициализирован. Проверьте подключение к серверу Triton.")

#     try:
#         logger.info(f"Подготовка запроса для Triton с промптом: '{prompt_text[:70]}...'")
        
#         prompt_tensor = httpclient.InferInput("prompt", [1], "BYTES")
#         #prompt_tensor.set_data_from_numpy(np.array([prompt_text.encode('utf-8')], dtype=np.object_))

#         prompt_tensor.set_data_from_numpy(np.array([prompt_text], dtype=np.object_))

#         response = triton_client.infer(
#             model_name=MODEL_NAME,
#             inputs=[prompt_tensor]
#         )

#         result_bytes = response.as_numpy("generated_text")[0]
#         result_json_str = result_bytes.decode('utf-8')

#         result_data = json.loads(result_json_str)
#         logger.info("[SUCCESS] Получен и обработан ответ от Triton.")
#         return result_data

#     except Exception as e:
#         logger.error(f"Произошла ошибка во время обращения к Triton: {e}")
#         raise e

def get_prediction_from_triton(prompt_text: str) -> dict:
    url = f"http://{TRITON_URL}/v2/models/{MODEL_NAME}/infer"

    payload = {
        "inputs": [
            {
                "name": "prompt",
                "shape": [1],
                "datatype": "BYTES",
                "data": [prompt_text]
            }
        ]
    }
    headers = {
        'Content-Type': 'application/json'
    }

    try:
        logger.info(f"Отправка ручного запроса на {url} с промптом: '{prompt_text[:70]}...'")
        
        json_payload = json.dumps(payload, ensure_ascii=False)
        data_payload = json_payload.encode('utf-8')
        response = requests.post(url, headers=headers, data=data_payload)
        response.raise_for_status()
        triton_response_data = response.json()
        output_data = None
        for output in triton_response_data.get('outputs', []):
            if output['name'] == 'generated_text':
                output_data = output['data'][0]
                break
        
        if output_data is None:
            logger.error(f"В ответе от Triton не найден output с именем 'generated_text'. Ответ: {triton_response_data}")
            raise ValueError("Не найден ожидаемый output в ответе от Triton")

        result_data = json.loads(output_data)
        logger.info("[SUCCESS] Получен и обработан ответ от Triton (ручной режим, UTF-8).")
        return result_data

    except requests.exceptions.RequestException as e:
        logger.error(f"Ошибка сети при обращении к Triton: {e}")
        raise ConnectionError(f"Ошибка сети при обращении к Triton: {e}")
    except json.JSONDecodeError as e:
        logger.error(f"Ошибка декодирования JSON от Triton. Ответ модели (если был получен): '{output_data}'")
        logger.error(f"Детали ошибки: {e}")
        raise HTTPException(status_code=500, detail="Модель вернула некорректный JSON.")
    except Exception as e:
        logger.error(f"Произошла непредвиденная ошибка во время обращения к Triton: {e}")
        raise e


#эндпоинты API 
@app.post("/api/auth/login", response_model=LoginResponse)
async def login_for_user(request: UserLogin):
    """
    эндпоинт для авторизации пользователя.
    принимает username и password, возвращает роль в случае успеха
    """
    logger.info(f"Попытка входа для пользователя: {request.username}")

    for user in users_db:
        if user["username"] == request.username and user["password"] == request.password:
            logger.info(f"Успешный вход для пользователя {request.username}. Роль: {user['role']}")
            return {"role": user["role"]}

    logger.warning(f"Неудачная попытка входа для пользователя: {request.username}")
    raise HTTPException(
        status_code=401, 
        detail="Incorrect username or password",
        headers={"WWW-Authenticate": "Bearer"},
    )

@app.post("/api/ai/generate-slides")
async def generate_slides(request: UserPrompt):
    """
    принимаю промпт, отправляю его модели и она возвращает сгенерированный json
    """
    logger.info(f"Получен запрос на /generate/ с промптом: '{request.prompt}'")
    try:
        generated_data = get_prediction_from_triton(request.prompt)
        return generated_data
    except ConnectionError as e:
        raise HTTPException(status_code=503, detail=f"Сервис временно недоступен: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Внутренняя ошибка сервера: {str(e)}")


@app.get("/health/")
async def health_check():
    """эндпоинт для проверки, что сервер жив и может подключиться к Triton"""
    if not triton_client or not triton_client.is_server_live():
        raise HTTPException(status_code=503, detail="Не удалось подключиться к Triton Inference Server.")
    return {"status": "ok", "triton_connection": "live"}


#запуск сервера fastapi
if __name__ == "__main__":
    # запускаю на порту APP_PORT (8001), чтобы не конфликтовать с Triton (8000)
    uvicorn.run("main:app", host="0.0.0.0", port=APP_PORT, reload=True)