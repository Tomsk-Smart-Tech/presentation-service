import { Slide } from "../types";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;
// const BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

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
        console.log(response)
        return response.json();

    };

export const generateSlides = async (prompt: string): Promise<Slide[]> => {
    const response = await fetch(`${BASE_URL}/api/ai/generate-slides`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Ошибка генерации слайдов' }));
        throw new Error(errorData.message || 'Сервер не смог сгенерировать презентацию');
    }

    return response.json();
};

export const getAiSettings = async () => {
    const response = await fetch(`${BASE_URL}/api/admin/ai-settings`);
    if (!response.ok) {
        throw new Error('Не удалось загрузить настройки ИИ');
    }
    return response.json();
};