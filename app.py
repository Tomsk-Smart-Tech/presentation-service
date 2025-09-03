import os
import json
from flask import Flask, jsonify, request, g
from flask_cors import CORS
import uuid
import jwt  # импортируем библиотеку JWT
from datetime import datetime, timedelta
from functools import wraps

# --- 1. Инициализация и Конфигурация ---
app = Flask(__name__)
CORS(app)

# Секретный ключ нужен для шифрования JWT токенов. Сделай его сложным!
app.config['SECRET_KEY'] = 'your-super-secret-key-for-hackathon'


# --- 2. Хелперы для работы с пользователями ---
def load_users():
    if not os.path.exists('users.json'):
        return []
    with open('users.json', 'r') as f:
        return json.load(f)


def find_user_by_username(username):
    users = load_users()
    for user in users:
        if user['username'] == username:
            return user
    return None


# --- 3. Наша временная база данных для презентаций ---
presentations_db = {}


# --- 4. Декоратор для проверки токена и ролей ---
def token_required(required_role=None):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            token = None
            # Проверяем наличие токена в заголовке Authorization
            if 'Authorization' in request.headers:
                # Ожидаемый формат: "Bearer <token>"
                auth_header = request.headers['Authorization']
                try:
                    token = auth_header.split(" ")[1]
                except IndexError:
                    return jsonify({'message': 'Malformed token header'}), 401

            if not token:
                return jsonify({'message': 'Token is missing!'}), 401

            try:
                # Декодируем токен
                data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
                # Помещаем данные пользователя в глобальный объект g, чтобы иметь к ним доступ в роуте
                g.current_user = data

                # Проверка роли, если она требуется
                if required_role and data.get('role') != required_role:
                    return jsonify({'message': 'Permission denied!'}), 403

            except jwt.ExpiredSignatureError:
                return jsonify({'message': 'Token has expired!'}), 401
            except jwt.InvalidTokenError:
                return jsonify({'message': 'Invalid token!'}), 401

            return f(*args, **kwargs)

        return decorated_function

    return decorator


# --- 5. Эндпоинты для аутентификации ---
@app.route('/api/auth/login', methods=['POST'])
def login():
    auth = request.get_json()
    if not auth or not auth.get('username') or not auth.get('password'):
        return jsonify({'message': 'Could not verify'}), 401

    user = find_user_by_username(auth['username'])
    if not user or user['password'] != auth['password']:
        return jsonify({'message': 'Invalid username or password'}), 401

    # Генерируем токен, который будет жить 24 часа
    token = jwt.encode({
        'user_id': user['id'],
        'username': user['username'],
        'role': user['role'],
        'exp': datetime.utcnow() + timedelta(hours=24)
    }, app.config['SECRET_KEY'], algorithm="HS256")

    return jsonify({'token': token})


# --- 6. Защищенные эндпоинты для презентаций ---

# Любой залогиненный пользователь может получить презентацию
@app.route('/api/presentations/<presentation_id>', methods=['GET'])
@token_required()
def get_presentation(presentation_id):
    # В g.current_user лежат данные из токена. Можно использовать для логики доступа.
    print(f"User {g.current_user['username']} is accessing presentation {presentation_id}")
    presentation = presentations_db.get(presentation_id)
    if not presentation:
        return jsonify({"error": "Presentation not found"}), 404
    return jsonify(presentation)


# Только админ может создавать новые презентации (для примера)
@app.route('/api/presentations', methods=['POST'])
@token_required(required_role='admin')
def save_presentation():
    presentation_data = request.get_json()
    if not presentation_data:
        return jsonify({"error": "No data provided"}), 400
    presentation_id = str(uuid.uuid4())
    presentations_db[presentation_id] = presentation_data
    return jsonify({"message": "Presentation saved successfully", "id": presentation_id}), 201


# Любой залогиненный пользователь может обновить
@app.route('/api/presentations/<presentation_id>', methods=['PUT'])
@token_required()
def update_presentation(presentation_id):
    if presentation_id not in presentations_db:
        return jsonify({"error": "Presentation not found"}), 404
    presentation_data = request.get_json()
    presentations_db[presentation_id] = presentation_data
    return jsonify({"message": "Presentation updated successfully"})


# Эндпоинт для ИИ, доступен любому залогиненному
@app.route('/api/ai/generate', methods=['POST'])
@token_required()
def generate_slides():
    data = request.get_json()
    prompt = data.get('prompt')
    if not prompt: return jsonify({"error": "Prompt is required"}), 400

    # ... логика взаимодействия с Никитой ...
    print(f"User {g.current_user['username']} generated slides with prompt: {prompt}")
    ai_generated_slides = {"slides": []}  # Заглушка
    return jsonify(ai_generated_slides)


# --- 7. Запуск сервера ---
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)