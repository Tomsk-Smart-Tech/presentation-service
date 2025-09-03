import uvicorn
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import tritonclient.http as httpclient
import numpy as np
import json
import logging

# --- Настройка логирования для лучшей отладки ---
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# --- Конфигурация ---
# Адрес вашего запущенного Triton сервера
TRITON_URL = "localhost:8000"
# Имя модели в Triton
MODEL_NAME = "eduscribe_mixtral"
# Порт, на котором будет работать НАШ FastAPI сервер
APP_PORT = 8001


# --- Создание клиента Triton ---
# Клиента лучше создать один раз при старте приложения для эффективности
try:
    triton_client = httpclient.InferenceServerClient(url=TRITON_URL)
    logger.info(f"Успешное подключение к Triton Inference Server по адресу: {TRITON_URL}")
except Exception as e:
    logger.error(f"Не удалось подключиться к Triton Inference Server: {e}")
    triton_client = None

# --- Инициализация FastAPI приложения ---
app = FastAPI(
    title="API для модели EduScribe",
    description="Прокси-сервер, который принимает промпты и отправляет их в модель на Triton Inference Server.",
    version="1.0.0"
)

# Модель данных для входящего запроса (что мы ожидаем от пользователя)
class UserPrompt(BaseModel):
    prompt: str

# --- Основная логика для обращения к Triton ---
def get_prediction_from_triton(prompt_text: str):
    """
    Отправляет текстовый промпт в модель на сервере Triton и возвращает результат.
    """
    if not triton_client:
        raise ConnectionError("Клиент Triton не инициализирован. Проверьте подключение к серверу Triton.")

    try:
        logger.info(f"Подготовка запроса для Triton с промптом: '{prompt_text[:50]}...'")
        # 1. Подготавливаем входной тензор
        prompt_tensor = httpclient.InferInput("USER_PROMPT", [1], "BYTES")
        prompt_tensor.set_data_from_numpy(np.array([prompt_text.encode('utf-8')], dtype=np.object_))

        # 2. Отправляем запрос на инференс
        response = triton_client.infer(
            model_name=MODEL_NAME,
            inputs=[prompt_tensor]
        )

        # 3. Получаем и декодируем результат
        result_bytes = response.as_numpy("GENERATED_JSON")[0]
        result_json_str = result_bytes.decode('utf-8')

        # 4. Преобразуем строку JSON в Python словарь
        result_data = json.loads(result_json_str)
        logger.info("[SUCCESS] Получен и обработан ответ от Triton.")
        return result_data

    except Exception as e:
        logger.error(f"Произошла ошибка во время обращения к Triton: {e}")
        # Перебрасываем исключение, чтобы его можно было поймать в эндпоинте
        raise e


# --- Эндпоинты API ---

@app.post("/generate/")
async def generate_slides(request: UserPrompt):
    """
    Основной эндпоинт: принимает промпт, отправляет его модели и возвращает сгенерированный JSON.
    """
    try:
        # Вызываем нашу основную функцию с текстом из запроса
        generated_data = get_prediction_from_triton(request.prompt)
        # FastAPI автоматически преобразует словарь в JSON-ответ
        return generated_data
    except ConnectionError as e:
        # Ошибка, если Triton недоступен
        raise HTTPException(status_code=503, detail=f"Сервис временно недоступен: {str(e)}")
    except Exception as e:
        # Любая другая ошибка в процессе
        raise HTTPException(status_code=500, detail=f"Внутренняя ошибка сервера: {str(e)}")


@app.get("/ping/")
async def ping():
    """Простой эндпоинт для проверки, что сервер жив."""
    return {"message": "pong"}


# --- Запуск сервера ---
if __name__ == "__main__":
    # Важно: запускаем на порту APP_PORT (8001), чтобы не конфликтовать с Triton
    uvicorn.run(app, host="0.0.0.0", port=APP_PORT)