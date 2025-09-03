# backend/app.py

from flask import Flask, jsonify, request
import flask_cors
import uuid

# 1. Инициализация приложения
app = Flask(__name__)
# Разрешаем CORS для всех доменов. Для продакшена лучше указать конкретный домен фронтенда.
flask_cors.CORS(app)

# 2. Наша временная база данных
# Ключ - ID презентации, значение - сама презентация в формате JSON (python dict)
presentations_db = {}


# 3. Создаем эндпоинты

# Эндпоинт для проверки, что сервер работает
@app.route('/api/status', methods=['GET'])
def status():
    return jsonify({"status": "ok"})


# Эндпоинт для сохранения НОВОЙ презентации
@app.route('/api/presentations', methods=['POST'])
def save_presentation():
    # Получаем JSON-данные из тела запроса
    presentation_data = request.get_json()
    if not presentation_data:
        return jsonify({"error": "No data provided"}), 400

    # Генерируем уникальный ID для новой презентации
    presentation_id = str(uuid.uuid4())
    presentations_db[presentation_id] = presentation_data

    print(f"Презентация сохранена с ID: {presentation_id}")  # Логирование для отладки
    return jsonify({"message": "Presentation saved successfully", "id": presentation_id}), 201


# Эндпоинт для получения (загрузки) существующей презентации
@app.route('/api/presentations/<presentation_id>', methods=['GET'])
def get_presentation(presentation_id):
    presentation = presentations_db.get(presentation_id)
    if not presentation:
        return jsonify({"error": "Presentation not found"}), 404

    return jsonify(presentation)


# Эндпоинт для ОБНОВЛЕНИЯ существующей презентации
@app.route('/api/presentations/<presentation_id>', methods=['PUT'])
def update_presentation(presentation_id):
    if presentation_id not in presentations_db:
        return jsonify({"error": "Presentation not found"}), 404

    presentation_data = request.get_json()
    if not presentation_data:
        return jsonify({"error": "No data provided"}), 400

    presentations_db[presentation_id] = presentation_data
    print(f"Презентация обновлена: {presentation_id}")  # Логирование для отладки
    return jsonify({"message": "Presentation updated successfully"})


# Эндпоинт для обработки промта от пользователя
@app.route('/api/ai/generate', methods=['POST'])
def generate_slides():
    data = request.get_json()
    prompt = data.get('prompt')

    if not prompt:
        return jsonify({"error": "Prompt is required"}), 400

    # --- ЗДЕСЬ ТЫ БУДЕШЬ ВЗАИМОДЕЙСТВОВАТЬ С НИКИТОЙ ---
    # Например, ты отправляешь HTTP запрос на его сервис
    # или просто вызываешь его функцию, если вы работаете в одном проекте.

    # Пока что мы просто вернем заглушку, как будто ИИ нам ответил.
    print(f"Получен промт для Никиты: {prompt}")

    # Этот JSON-ответ должен сгенерировать Никита, здесь просто пример
    ai_generated_slides = {
        "slides": [
            {
                "slideId": str(uuid.uuid4()),
                "shapes": [
                    {"id": str(uuid.uuid4()), "type": "text", "text": "Слайд 1 по теме: " + prompt, "x": 50, "y": 50,
                     "fontSize": 24, "fill": "#000"},
                ]
            },
            {
                "slideId": str(uuid.uuid4()),
                "shapes": [
                    {"id": str(uuid.uuid4()), "type": "text", "text": "Слайд 2", "x": 50, "y": 50, "fontSize": 24,
                     "fill": "#000"},
                ]
            }
        ]
    }

    return jsonify(ai_generated_slides)


# 4. Запуск сервера
if __name__ == '__main__':
    # host='0.0.0.0' делает сервер доступным в локальной сети
    app.run(host='0.0.0.0', port=5000, debug=True)