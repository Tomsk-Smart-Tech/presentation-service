import { Slide } from "../types";
import { v4 as uuidv4 } from 'uuid';

const base64RedDot = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

export const mockAiApiCall = (prompt: string): Promise<Slide[]> => {
    console.log("AI получил промпт:", prompt);

    const presentationData: Slide[] = [
        {
            id: uuidv4(),
            shapes: [
                {
                    id: uuidv4(),
                    type: 'text',
                    text: `Презентация на тему: "${prompt}"`,
                    x: 100, y: 100,
                    width: 1080, height: 120,
                    fontSize: 80,
                    fill: '#333333',
                    rotation: 0,
                    fontFamily: 'Georgia', // <-- ДОБАВЛЕНО
                },
                {
                    id: uuidv4(),
                    type: 'text',
                    text: 'Сгенерировано AI Presenter',
                    x: 100, y: 550,
                    width: 1080, height: 50,
                    fontSize: 32,
                    fill: '#888888',
                    rotation: 0,
                    fontFamily: 'Arial', // <-- ДОБАВЛЕНО
                }
            ],
        },
        {
            id: uuidv4(),
            shapes: [
                {
                    id: uuidv4(),
                    type: 'text',
                    text: 'Ключевые моменты',
                    x: 50, y: 50,
                    width: 600, height: 70,
                    fontSize: 58,
                    fill: '#007acc',
                    rotation: 0,
                    fontFamily: 'Verdana',
                },
                {
                    id: uuidv4(),
                    type: 'rect',
                    x: 50, y: 150,
                    width: 500, height: 5,
                    fill: '#007acc',
                    rotation: 0,
                },
                {
                    id: uuidv4(),
                    type: 'image',
                    src: base64RedDot,
                    x: 700, y: 150,
                    width: 400, height: 400,
                    fill: '',
                    rotation: 15,
                }
            ],
        }
    ];

    return new Promise(resolve => {
        setTimeout(() => {
            resolve(presentationData);
        }, 2000);
    });
};