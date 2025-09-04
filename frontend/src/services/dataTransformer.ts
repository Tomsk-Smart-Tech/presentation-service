import { v4 as uuidv4 } from 'uuid';
import { Slide, Shape } from '../types';

// Эта функция - "мозг" для преобразования ответа ИИ в наши слайды
export const transformAiResponseToSlides = (aiResponse: any): Slide[] => {
    if (!aiResponse || !Array.isArray(aiResponse.slides)) {
        console.error("Неверный формат ответа от ИИ", aiResponse);
        return [];
    }

    const newSlides: Slide[] = aiResponse.slides.map((slideData: any): Slide => {
        const shapes: Shape[] = [];
        const slideId = uuidv4();

        // Используем switch для обработки разных типов слайдов
        switch (slideData.type) {
            case 'title_slide':
                // Заголовок
                if (slideData.title) {
                    shapes.push({
                        id: uuidv4(), type: 'text', x: 60, y: 250,
                        width: 1160, height: 120, text: slideData.title,
                        fontSize: 80, fontFamily: 'Georgia', fill: '#333333', rotation: 0
                    });
                }
                // Подзаголовок
                if (slideData.subtitle) {
                    shapes.push({
                        id: uuidv4(), type: 'text', x: 60, y: 380,
                        width: 1160, height: 50, text: slideData.subtitle,
                        fontSize: 40, fontFamily: 'Arial', fill: '#555555', rotation: 0
                    });
                }
                break;

            case 'content_slide':
                // Заголовок
                if (slideData.title) {
                    shapes.push({
                        id: uuidv4(), type: 'text', x: 50, y: 50,
                        width: 680, height: 70, text: slideData.title,
                        fontSize: 58, fontFamily: 'Verdana', fill: '#005A9C', rotation: 0
                    });
                }
                // Контент (объединяем массив строк в один текстовый блок)
                if (Array.isArray(slideData.content)) {
                    // v-- ИСПРАВЛЕНИЕ ЗДЕСЬ --v
                    const contentText = slideData.content.map((item: string) => `• ${item}`).join('\n\n');
                    // ^-- ИСПРАВЛЕНИЕ ЗДЕСЬ --^
                    shapes.push({
                        id: uuidv4(), type: 'text', x: 50, y: 150,
                        width: 680, height: 500, text: contentText,
                        fontSize: 32, fontFamily: 'Arial', fill: '#333333', rotation: 0
                    });
                }
                // Изображение (ожидаем, что сервер пришлет `src` с base64, а не image_description)
                // Если сервер все еще шлет image_description, нужно будет добавить логику, как в прошлых версиях
                if (slideData.src) {
                    shapes.push({
                        id: uuidv4(), type: 'image', x: 800, y: 150,
                        width: 430, height: 430, src: slideData.src,
                        fill: '', rotation: 0
                    });
                }
                break;

            case 'image_slide':
                // Заголовок
                if (slideData.title) {
                    shapes.push({
                        id: uuidv4(), type: 'text', x: 50, y: 50,
                        width: 1180, height: 70, text: slideData.title,
                        fontSize: 58, fontFamily: 'Verdana', fill: '#333333', rotation: 0
                    });
                }
                // Изображение
                if (slideData.src) {
                    shapes.push({
                        id: uuidv4(), type: 'image', x: 140, y: 150,
                        width: 1000, height: 550, src: slideData.src,
                        fill: '', rotation: 0
                    });
                }
                break;

            case 'final_slide':
                // Заголовок
                if (slideData.title) {
                    shapes.push({
                        id: uuidv4(), type: 'text', x: 60, y: 300,
                        width: 1160, height: 90, text: slideData.title,
                        fontSize: 72, fontFamily: 'Georgia', fill: '#333333', rotation: 0
                    });
                }
                // Подзаголовок
                if (slideData.subtitle) {
                    shapes.push({
                        id: uuidv4(), type: 'text', x: 60, y: 400,
                        width: 1160, height: 50, text: slideData.subtitle,
                        fontSize: 36, fontFamily: 'Arial', fill: '#555555', rotation: 0
                    });
                }
                break;
        }

        return { id: slideId, shapes };
    });

    return newSlides;
};