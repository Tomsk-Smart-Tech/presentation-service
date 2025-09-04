import { Slide } from "../types";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

export const loginUser = async (username: string, password: string) => {
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Неверный логин или пароль' }));
        throw new Error(errorData.message || 'Ошибка аутентификации');
    }

    return response.json();
};

// Теперь эта функция возвращает Promise<any>, так как мы не знаем точный формат ответа
export const generateSlides = async (prompt: string): Promise<any> => {
    const requestBody = {
        prompt: prompt
    };

    console.log("Отправляем на сервер:", JSON.stringify(requestBody, null, 2));

    const response = await fetch(`${BASE_URL}/api/ai/generate-slides`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Ошибка генерации слайдов' }));
        console.error("Сервер вернул ошибку:", errorData);
        const errorMessage = errorData.detail?.[0]?.msg || errorData.message || 'Сервер не смог сгенерировать презентацию';
        throw new Error(errorMessage);
    }

    // Просто возвращаем "сырой" JSON
    return response.json();
};

export const getAiSettings = async () => {
    const response = await fetch(`${BASE_URL}/api/admin/ai-settings`);
    if (!response.ok) {
        throw new Error('Не удалось загрузить настройки ИИ');
    }
    return response.json();
};