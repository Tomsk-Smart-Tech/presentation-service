// src/components/Toolbar/TopToolbar.tsx
import React, { useRef } from 'react';
import './Toolbar.css';

interface TopToolbarProps {
    onAddShape: (type: 'rect' | 'circle' | 'triangle' | 'text') => void;
    // NEW: Новая функция для добавления изображения
    onAddImage: (src: string, width: number, height: number) => void;
    onOpenSettings: () => void;
    onStartPresentation: () => void;
}

export const TopToolbar = ({ onAddShape, onAddImage, onOpenSettings, onStartPresentation }: TopToolbarProps) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            const src = reader.result as string;
            const img = new window.Image();
            img.onload = () => {
                // Задаем начальный разумный размер
                const MAX_WIDTH = 300;
                const scale = MAX_WIDTH / img.width;
                const width = img.width * scale;
                const height = img.height * scale;
                onAddImage(src, width, height);
            };
            img.src = src;
        };
        reader.readAsDataURL(file);

        // Сбрасываем значение инпута, чтобы можно было загрузить тот же файл снова
        if(fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
        <div className="top-toolbar">
            <div className="shape-buttons">
                <button onClick={() => onAddShape('rect')}>□</button>
                <button onClick={() => onAddShape('circle')}>○</button>
                <button onClick={() => onAddShape('triangle')}>△</button>
                <button onClick={() => onAddShape('text')}>T</button>
                {/* NEW: Кнопка для добавления изображения */}
                <button onClick={() => fileInputRef.current?.click()}>🖼️</button>
            </div>

            {/* NEW: Скрытый инпут для выбора файла */}
            <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept="image/*"
                onChange={handleFileChange}
            />

            <button className="settings-btn" onClick={onOpenSettings}>⚙️</button>
            <button className="play-btn" onClick={onStartPresentation}>▶</button>
        </div>
    );
};