// src/components/PresentationView/PresentationView.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { Stage, Layer, Rect, Ellipse, RegularPolygon, Text, Group } from 'react-konva';
import { Slide, Shape, ImageShape, TextShape } from '../../types';
import './PresentationView.css';
import { URLImage } from '../Canvas/URLImage';

interface PresentationViewProps {
    slides: Slide[];
    onClose: () => void;
}

export const PresentationView = ({ slides, onClose }: PresentationViewProps) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const activeSlide = slides[currentIndex];

    const goToNext = () => setCurrentIndex((prev) => Math.min(prev + 1, slides.length - 1));
    const goToPrev = () => setCurrentIndex((prev) => Math.max(prev - 1, 0));

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight') goToNext();
            if (e.key === 'ArrowLeft') goToPrev();
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [goToNext, goToPrev, onClose]); // Добавлены зависимости для чистоты кода

    const slideSize = useMemo(() => {
        const BASE_WIDTH = 1280; // Базовая ширина холста в редакторе
        const BASE_HEIGHT = 720; // Базовая высота
        const ratio = BASE_WIDTH / BASE_HEIGHT;
        let width = window.innerWidth;
        let height = window.innerWidth / ratio;
        if (height > window.innerHeight) {
            height = window.innerHeight;
            width = window.innerHeight * ratio;
        }
        return { width, height };
    }, []);

    // Коэффициент масштабирования всей сцены
    const scale = slideSize.width / 1280;

    return (
        <div className="presentation-overlay">
            <Stage width={window.innerWidth} height={window.innerHeight}>
                <Layer>
                    <Rect x={0} y={0} width={window.innerWidth} height={window.innerHeight} fill="black" />

                    {/* Эта группа центрирует наш слайд на экране */}
                    <Group
                        x={(window.innerWidth - slideSize.width) / 2}
                        y={(window.innerHeight - slideSize.height) / 2}
                    >
                        <Rect width={slideSize.width} height={slideSize.height} fill="white" />

                        {/* FIX: Эта вложенная группа МАСШТАБИРУЕТ все фигуры разом */}
                        <Group scaleX={scale} scaleY={scale}>
                            {activeSlide.shapes.map((shape: Shape) => {
                                // ВАЖНО: Мы больше не масштабируем пропсы вручную!
                                // Передаем оригинальные значения из состояния.
                                const commonProps = { ...shape, draggable: false };

                                switch (shape.type) {
                                    case 'rect': return <Rect key={shape.id} {...commonProps} />;
                                    case 'circle': return <Ellipse key={shape.id} {...commonProps} radiusX={shape.width / 2} radiusY={shape.height / 2} />;
                                    case 'triangle': return <RegularPolygon key={shape.id} {...commonProps} sides={3} radius={shape.height / 2} scaleX={shape.width / shape.height} />;
                                    case 'text': return <Text key={shape.id} {...commonProps} verticalAlign="middle" />;
                                    case 'image': return <URLImage key={shape.id} shape={shape as ImageShape} {...commonProps} />;
                                    default: return null;
                                }
                            })}
                        </Group>

                    </Group>
                </Layer>
            </Stage>
            <div className="presentation-controls">
                <button onClick={goToPrev} disabled={currentIndex === 0}>‹</button>
                <span>{currentIndex + 1} / {slides.length}</span>
                <button onClick={goToNext} disabled={currentIndex === slides.length - 1}>›</button>
            </div>
            <button className="presentation-exit" onClick={onClose}>✕</button>
        </div>
    );
};