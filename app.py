# app.py
from flask import Flask, jsonify, request

# Создаем экземпляр приложения Flask
app = Flask(__name__)

# --- API-ЗАГЛУШКИ ---

# Временное хранилище данных (вместо базы данных)
mock_presentation = {
    "id": 1,
    "title": "Урок по Фотосинтезу",
    "slides": [
        {
            "id": 1,
            "type": "title_slide",
            "content": {
                "title": "Что такое фотосинтез?",
                "subtitle": "Урок для 6 класса"
            }
        },
        {
            "id": 2,
            "type": "text_and_image_slide",
            "content": {
                "text": "Это процесс, при котором растения используют свет для создания пищи.",
                "image_url": "https://example.com/photosynthesis.jpg"
            }
        }
    ]
}


# Эндпоинт для получения одной презентации (пока всегда одной и той же)
@app.route('/api/presentations/1', methods=['GET'])
def get_presentation():
    """Отдает заранее подготовленную презентацию."""
    print("Фронтенд запросил презентацию!")
    return jsonify(mock_presentation)


# Эндпоинт для обработки промта от пользователя
@app.route('/api/generate-slides', methods=['POST'])
def generate_slides():
    """Принимает промт от фронтенда."""
    data = request.get_json()
    user_prompt = data.get('prompt')

    if not user_prompt:
        return jsonify({"error": "Промт не найден"}), 400

    print(f"Получили промт от пользователя: '{user_prompt}'")

    # --- ЗДЕСЬ ТЫ БУДЕШЬ ПЕРЕДАВАТЬ ПРОМТ НИКИТЕ ---
    # А пока просто вернем успешный ответ и пример сгенерированных слайдов

    mock_generated_slides = {
        "slides": [
            {"id": 3, "content": {"title": "Сгенерированный слайд 1"}},
            {"id": 4, "content": {"title": "Сгенерированный слайд 2"}}
        ]
    }

    return jsonify(mock_generated_slides)


# Запуск сервера для разработки
if __name__ == '__main__':
    # host='0.0.0.0' делает сервер видимым в локальной сети
    # port=5001 чтобы не конфликтовать с портом фронтенда (часто 5000)
    app.run(host='0.0.0.0', port=5001, debug=True)