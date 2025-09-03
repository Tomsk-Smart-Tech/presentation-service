import tritonclient.http as httpclient
import numpy as np
import json

# Создаем клиент, указывая адрес сервера
client = httpclient.InferenceServerClient(url="localhost:8000")

# Пользовательский запрос
user_prompt = "Создай 3 слайда про строение атома для 8 класса"

# Подготавливаем входной тензор
prompt_tensor = httpclient.InferInput("USER_PROMPT", [1], "BYTES")
prompt_tensor.set_data_from_numpy(np.array([user_prompt.encode('utf-8')], dtype=np.object_))

print(f"Отправка запроса к Triton: '{user_prompt}'")

# Отправляем запрос на инференс
response = client.infer(
    model_name="eduscribe_mixtral",
    inputs=[prompt_tensor]
)

# Получаем результат из выходного тензора
result_bytes = response.as_numpy("GENERATED_JSON")[0]
result_json_str = result_bytes.decode('utf-8')

# Преобразуем строку в словарь и красиво печатаем
result_data = json.loads(result_json_str)

print("\n[SUCCESS] Получен ответ от сервера Triton:")
print(json.dumps(result_data, indent=2, ensure_ascii=False))