# Шаг 1: Начинаем с официального образа Triton, который уже содержит CUDA и Python
FROM nvcr.io/nvidia/tritonserver:25.08-py3
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    gnupg \
    && rm -rf /var/lib/apt/lists/*

# Добавляем репозиторий Kitware для CMake, используя современный и безопасный метод
# ИСПРАВЛЕНО: Указываем 'jammy', а не 'bionic'
RUN wget -O - https://apt.kitware.com/keys/kitware-archive-latest.asc | gpg --dearmor -o /usr/share/keyrings/kitware-archive-keyring.gpg \
    && echo 'deb [signed-by=/usr/share/keyrings/kitware-archive-keyring.gpg] https://apt.kitware.com/ubuntu/ jammy main' | tee /etc/apt/sources.list.d/kitware.list > /dev/null \
    && apt-get update \
    && apt-get install -y --no-install-recommends \
    cmake \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# RUN python3 -m pip install --upgrade --break-system-packages pip

# RUN python3 -m pip install --upgrade --break-system-packages pip

# Устанавливаем pip с помощью официального скрипта
# RUN curl -sS https://bootstrap.pypa.io/get-pip.py | python3

# Шаг 4: Устанавливаем переменные окружения для сборки с CUDA
ENV LD_LIBRARY_PATH=$LD_LIBRARY_PATH:/usr/local/cuda/lib64/stubs
ENV CMAKE_ARGS="-DGGML_CUDA=on"
ENV FORCE_CMAKE=1

# Шаг 5: Устанавливаем llama-cpp-python
# Переменные окружения будут автоматически подхвачены pip
RUN pip install --no-cache-dir llama-cpp-python