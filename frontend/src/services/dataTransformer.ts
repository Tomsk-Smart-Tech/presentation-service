import { v4 as uuidv4 } from 'uuid';
import { Slide, Shape, TextShape, ImageShape } from '../types';

// ===================================================================
// === ЦЕНТРАЛЬНОЕ ХРАНИЛИЩЕ ШАБЛОНОВ (Single Source of Truth) ===
// ===================================================================

// --- ИЗМЕНЕНИЕ ЗДЕСЬ: Добавляем тип для одного элемента шаблона ---
type TemplatePart = Omit<TextShape, 'id' | 'text'> | Omit<ImageShape, 'id' | 'src'>;

// --- ИЗМЕНЕНИЕ ЗДЕСЬ: Добавляем тип для всего хранилища ---
// Мы говорим TypeScript, что у каждого шаблона могут быть опциональные (?) ключи.
const SLIDE_TEMPLATES: {
    [key: string]: {
        title?: TemplatePart;
        subtitle?: TemplatePart;
        content?: TemplatePart;
        image?: TemplatePart;
    }
} = {
    title_slide: {
        title: { type: 'text', x: 60, y: 250, width: 1160, height: 120, fontSize: 80, fontFamily: 'Georgia', fill: '#333333', rotation: 0 },
        subtitle: { type: 'text', x: 60, y: 380, width: 1160, height: 50, fontSize: 40, fontFamily: 'Arial', fill: '#555555', rotation: 0 }
    },
    content_slide: {
        title: { type: 'text', x: 50, y: 50, width: 680, height: 70, fontSize: 58, fontFamily: 'Verdana', fill: '#005A9C', rotation: 0 },
        content: { type: 'text', x: 50, y: 150, width: 680, height: 500, fontSize: 32, fontFamily: 'Arial', fill: '#333333', rotation: 0 },
        image: { type: 'image', x: 800, y: 150, width: 430, height: 430, fill: '', rotation: 0 }
    },
    image_slide: {
        title: { type: 'text', x: 50, y: 50, width: 1180, height: 70, fontSize: 58, fontFamily: 'Verdana', fill: '#333333', rotation: 0 },
        image: { type: 'image', x: 140, y: 150, width: 1000, height: 550, fill: '', rotation: 0 }
    },
    final_slide: {
        title: { type: 'text', x: 60, y: 300, width: 1160, height: 90, fontSize: 72, fontFamily: 'Georgia', fill: '#333333', rotation: 0 },
        subtitle: { type: 'text', x: 60, y: 400, width: 1160, height: 50, fontSize: 36, fontFamily: 'Arial', fill: '#555555', rotation: 0 }
    }
};

// ===================================================================
// === "Движок" для применения шаблонов ===
// ===================================================================

export const transformAiResponseToSlides = (aiResponse: any): Slide[] => {
    if (!aiResponse || !Array.isArray(aiResponse.slides)) {
        console.error("Неверный формат ответа от ИИ", aiResponse);
        return [];
    }

    return aiResponse.slides.map((slideData: any): Slide => {
        const shapes: Shape[] = [];
        const slideId = uuidv4();

        const template = SLIDE_TEMPLATES[slideData.type as keyof typeof SLIDE_TEMPLATES];

        if (!template) {
            console.warn(`Не найден шаблон для типа слайда: ${slideData.type}`);
            return { id: slideId, shapes: [] };
        }

        if (slideData.title && template.title) {
            shapes.push({
                ...template.title,
                id: uuidv4(),
                text: slideData.title,
            } as Shape);
        }

        if (slideData.subtitle && template.subtitle) {
            shapes.push({
                ...template.subtitle,
                id: uuidv4(),
                text: slideData.subtitle,
            } as Shape);
        }

        if (Array.isArray(slideData.content) && template.content) {
            const contentText = slideData.content.map((item: string) => `• ${item}`).join('\n\n');
            shapes.push({
                ...template.content,
                id: uuidv4(),
                text: contentText,
            } as Shape);
        }

        if (slideData.src && template.image) {
            shapes.push({
                ...template.image,
                id: uuidv4(),
                src: slideData.src,
            } as Shape);
        } else if (slideData.image_description && template.image) {
            const placeholderText = encodeURIComponent(slideData.image_description);
            // --- ИЗМЕНЕНИЕ ЗДЕСЬ: Добавляем проверку, что template.image не undefined ---
            const width = (template.image as ImageShape)?.width || 400;
            const height = (template.image as ImageShape)?.height || 300;
            shapes.push({
                ...template.image,
                id: uuidv4(),
                src: `https://placehold.co/${width}x${height}/EFEFEF/AAAAAA?text=${placeholderText}`,
            } as Shape);
        }

        return { id: slideId, shapes };
    });
};