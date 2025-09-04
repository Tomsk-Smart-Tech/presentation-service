#!/bin/bash

# Линтер
# Проверяет docker-compose.yml и Dockerfile для FastAPI бэкенда.

# Цвета для вывода
COLOR_GREEN='\033[0;32m'
COLOR_RED='\033[0;31m'
COLOR_YELLOW='\033[1;33m'
COLOR_NC='\033[0m' # No Color

PASS_COUNT=0
FAIL_COUNT=0

# $1 - Тип сообщения (CHECK, PASS, FAIL, INFO)
# $2 - Текст сообщения
print_message() {
    case "$1" in
        CHECK)
            echo -e "[?] ${COLOR_YELLOW}ПРОВЕРКА:${COLOR_NC} $2"
            ;;
        PASS)
            echo -e "[✓] ${COLOR_GREEN}ПРОЙДЕНО:${COLOR_NC} $2"
            ((PASS_COUNT++))
            ;;
        FAIL)
            echo -e "[✗] ${COLOR_RED}ПРОВАЛ:${COLOR_NC} $2"
            ((FAIL_COUNT++))
            ;;
        INFO)
            echo -e "\n--- $1 ---"
            ;;
    esac
}

# $1 - Файл для проверки
# $2 - Строка (регулярное выражение) для поиска
check_in_file() {
    if grep -q "$2" "$1"; then
        return 0 # Найдено
    else
        return 1 # Не найдено
    fi
}


lint_docker_compose() {
    print_message INFO "Анализ файла docker-compose.yml"
    local file="docker-compose.yml"

    if [ ! -f "$file" ]; then
        print_message FAIL "Файл $file не найден!"
        return
    fi

    # Проверки для triton
    print_message CHECK "Сервис 'triton': выделение GPU"
    if check_in_file "$file" "driver: nvidia"; then
        print_message PASS "Найдена конфигурация для nvidia gpu."
    else
        print_message FAIL "Не найдена конфигурация 'deploy.resources' для выделения GPU. Triton не сможет использовать видеокарту."
    fi

    print_message CHECK "Сервис 'triton': проброс тома с моделями"
    if check_in_file "$file" " ./models:/models"; then
        print_message PASS "Том для моделей '/models' корректно проброшен."
    else
        print_message FAIL "Не найден volume-маппинг './models:/models'. Triton не найдет модели для загрузки."
    fi
    
    print_message CHECK "Сервис 'triton': команда запуска сервера"
    if check_in_file "$file" "command: tritonserver --model-repository=/models"; then
        print_message PASS "Команда для запуска Triton сервера указана верно."
    else
        print_message FAIL "Команда для запуска Triton неверна или отсутствует. Должно быть: 'tritonserver --model-repository=/models'."
    fi

    # Проверки для backend
    print_message CHECK "Сервис 'backend': зависимость от 'triton'"
    if check_in_file "$file" "depends_on:" && grep -A 2 "depends_on:" "$file" | grep -q "triton"; then
        print_message PASS "Сервис 'backend' корректно зависит от 'triton'."
    else
        print_message FAIL "Отсутствует 'depends_on: - triton' для сервиса 'backend'. Бэкенд может запуститься раньше, чем AI-сервер."
    fi
    
    print_message CHECK "Сервис 'backend': переменная окружения для URL Triton"
    if check_in_file "$file" "TRITON_SERVER_URL: \"http://triton:8000\""; then
        print_message PASS "Переменная TRITON_SERVER_URL установлена корректно."
    else
        print_message FAIL "Отсутствует переменная окружения TRITON_SERVER_URL. Бэкенд не будет знать, куда отправлять запросы."
    fi

    print_message CHECK "Сервис 'backend': подключение к общей сети"
    if check_in_file "$file" "app_network"; then
        print_message PASS "Сервисы используют общую сеть 'app_network'."
    else
        print_message FAIL "Сервисы не используют общую сеть. Они не смогут общаться по именам."
    fi
}

lint_fastapi_dockerfile() {
    print_message INFO "Анализ файла backend/Dockerfile"
    local file="backend/Dockerfile"

    if [ ! -f "$file" ]; then
        print_message FAIL "Файл $file не найден!"
        return
    fi

    print_message CHECK "Оптимальный порядок команд для кэширования"
    # Получаем номера строк для команд
    local req_line=$(grep -n "COPY requirements.txt" "$file" | cut -d: -f1)
    local copy_all_line=$(grep -n "COPY \. \." "$file" | cut -d: -f1)
    if [[ -n "$req_line" && -n "$copy_all_line" && "$req_line" -lt "$copy_all_line" ]]; then
        print_message PASS "Порядок 'COPY requirements.txt' и 'COPY . .' оптимален для кэширования."
    else
        print_message FAIL "Команда 'COPY . .' должна идти после 'COPY requirements.txt' и 'pip install'. Это ускорит сборку."
    fi

    print_message CHECK "Запуск Uvicorn на хосте 0.0.0.0"
    if check_in_file "$file" "uvicorn" && check_in_file "$file" "0.0.0.0"; then
        print_message PASS "Сервер Uvicorn запускается на хосте 0.0.0.0 и будет доступен извне контейнера."
    else
        print_message FAIL "Команда запуска должна содержать 'uvicorn' и '--host 0.0.0.0'. Иначе к бэкенду нельзя будет подключиться."
    fi
}

echo "========================================="
echo "      Запуск Линтера Конфигурации        "
echo "========================================="

lint_docker_compose
lint_fastapi_dockerfile

echo "========================================="
echo "Линтинг завершен."
echo -e "${COLOR_GREEN}Проверки ПРОЙДЕНЫ: $PASS_COUNT${COLOR_NC}"
echo -e "${COLOR_RED}Проверки ПРОВАЛЕНЫ: $FAIL_COUNT${COLOR_NC}"
echo "========================================="

# Если были проваленные проверки
if [ "$FAIL_COUNT" -gt 0 ]; then
    exit 1
else
    exit 0
fi
