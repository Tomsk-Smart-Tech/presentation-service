import requests

# Тестируем GET
r = requests.get("http://127.0.0.1:8000/ping/")
print(r.json())

# Тестируем POST
data = {"text": "тут промпт!!"}
r = requests.post("http://127.0.0.1:8000/send/", json=data)
print(r.json())