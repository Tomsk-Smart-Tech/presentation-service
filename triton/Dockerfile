# Шаг 1: Начинаем с официального образа Triton, который уже содержит CUDA и Python
FROM nvcr.io/nvidia/tritonserver:24.01-py3

# Шаг 2: Устанавливаем системные зависимости, которые могут понадобиться для компиляции
# build-essential - это набор компиляторов (gcc, g++), cmake - система сборки
RUN apt-get update && apt-get install -y --no-install-recommends \
    cmake \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Шаг 3: Устанавливаем саму библиотеку llama-cpp-python с поддержкой GPU (cuBLAS)
# CMAKE_ARGS - это флаги, которые передаются системе сборки cmake во время установки.
# -DLLAMA_CUBLAS=on - это "волшебный" флаг, который включает компиляцию с поддержкой NVIDIA GPU.
# --no-cache-dir - хорошая практика, чтобы не засорять образ кэшем pip.
RUN CMAKE_ARGS="-DLLAMA_CUBLAS=on" pip install --upgrade --no-cache-dir llama-cpp-python

# Команда, которая будет выполняться при запуске контейнера, уже задана в базовом образе,
# поэтому нам не нужно ее здесь указывать. Мы переопределим ее в docker-compose.yml.