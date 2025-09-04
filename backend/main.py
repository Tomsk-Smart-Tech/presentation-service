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

# Загружаем переменные из .env файла в окружение.
load_dotenv()
TRITON_URL = os.getenv("TRITON_URL", "localhost:8000")
# Переменные окружения всегда строки, поэтому порт нужно превратить в число (int)
APP_PORT = int(os.getenv("APP_PORT", 8001))
MODEL_NAME = "mixtral"

# --- Настройка логирования для лучшей отладки ---
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


# --- Создание клиента Triton ---
# Клиента лучше создать один раз при старте приложения для эффективности
try:
    triton_client = httpclient.InferenceServerClient(url=TRITON_URL)
    # Проверяем, жив ли сервер Triton при старте
    if not triton_client.is_server_live():
         raise ConnectionError("Triton server is not live")
    logger.info(f"Успешное подключение к Triton Inference Server по адресу: {TRITON_URL}")
except Exception as e:
    logger.error(f"Не удалось подключиться к Triton Inference Server: {e}")
    # Если Triton недоступен при старте, приложение не сможет работать
    triton_client = None


# --- Загрузка "базы данных" пользователей при старте приложения ---
try:
    base_dir = os.path.dirname(os.path.abspath(__file__))
    # 2. Соединяем путь к директории с именем файла
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


# --- Инициализация FastAPI приложения ---
app = FastAPI(
    title="API для генерации презентаций",
    description="Прокси-сервер для модели на Triton Inference Server.",
    version="1.0.0"
)

# --- Настройка CORS (Cross-Origin Resource Sharing) ---
# Это КРАЙНЕ ВАЖНО, чтобы ваш фронтенд мог обращаться к этому API
# origins = [
#     "http://localhost",       # Разрешаем запросы с локального хоста
#     "http://localhost:3000",  # Пример: если ваш фронтенд на React работает на порту 3000
#     "http://127.0.0.1:3000",
#     # "*" # Можно разрешить все источники, но это менее безопасно
# ]

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"], # Разрешаем все методы (GET, POST и т.д.)
    allow_headers=["*"], # Разрешаем все заголовки
)


# Модель данных для входящего запроса (что мы ожидаем от фронтенда)
class UserPrompt(BaseModel):
    prompt: str

# Модель для запроса на авторизацию (что мы ждем от фронта)
class UserLogin(BaseModel):
    username: str
    password: str

# Модель для успешного ответа авторизации (что мы отправим на фронт)
class LoginResponse(BaseModel):
    role: str

# --- Основная логика для обращения к Triton ---
def get_prediction_from_triton(prompt_text: str) -> dict:
    """
    Отправляет текстовый промпт в модель на сервере Triton и возвращает результат в виде словаря.
    """
    if not triton_client:
        raise ConnectionError("Клиент Triton не инициализирован. Проверьте подключение к серверу Triton.")

    try:
        logger.info(f"Подготовка запроса для Triton с промптом: '{prompt_text[:70]}...'")
        
        # 1. Подготавливаем входной тензор
        prompt_tensor = httpclient.InferInput("prompt", [1], "BYTES")
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

@app.post("/api/auth/login", response_model=LoginResponse)
async def login_for_user(request: UserLogin):
    """
    Эндпоинт для авторизации пользователя.
    Принимает username и password, возвращает роль в случае успеха.
    """
    logger.info(f"Попытка входа для пользователя: {request.username}")

    # Ищем пользователя в нашей "базе данных"
    for user in users_db:
        # ВАЖНО: Прямое сравнение паролей - это очень небезопасно!
        # В реальных проектах используются хэши паролей.
        if user["username"] == request.username and user["password"] == request.password:
            logger.info(f"Успешный вход для пользователя {request.username}. Роль: {user['role']}")
            return {"role": user["role"]}

    # Если цикл завершился, а пользователь не найден
    logger.warning(f"Неудачная попытка входа для пользователя: {request.username}")
    raise HTTPException(
        status_code=401, # 401 Unauthorized - стандартный код для ошибки входа
        detail="Incorrect username or password",
        headers={"WWW-Authenticate": "Bearer"},
    )

@app.post("/api/ai/generate-slides")
async def generate_slides(request: UserPrompt):
    """
    Основной эндпоинт: принимает промпт, отправляет его модели и возвращает сгенерированный JSON.
    """
    logger.info(f"Получен запрос на /generate/ с промптом: '{request.prompt}'")
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


@app.get("/health/")
async def health_check():
    """Эндпоинт для проверки, что сервер жив и может подключиться к Triton."""
    if not triton_client or not triton_client.is_server_live():
        raise HTTPException(status_code=503, detail="Не удалось подключиться к Triton Inference Server.")
    return {"status": "ok", "triton_connection": "live"}


# --- Запуск сервера ---
if __name__ == "__main__":
    # Запускаем на порту APP_PORT (8001), чтобы не конфликтовать с Triton (8000)
    uvicorn.run("main:app", host="0.0.0.0", port=APP_PORT, reload=True)