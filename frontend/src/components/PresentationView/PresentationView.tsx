// src/components/PresentationView/PresentationView.tsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Stage, Layer, Rect, Ellipse, RegularPolygon, Text, Group } from 'react-konva';
import { Slide, Shape, TextShape } from '../../types';
import './PresentationView.css';
import { URLImage } from '../Canvas/URLImage';

const LOGICAL_WIDTH = 1280;

interface PresentationViewProps {
    slides: Slide[];
    onClose: () => void;
    aspectRatio: string;
}

// --- ПОЛНАЯ РЕАЛИЗАЦИЯ ХУКА useWindowSize ---
const useWindowSize = () => {
    const [size, setSize] = useState({
        width: window.innerWidth,
        height: window.innerHeight,
    });
    useEffect(() => {
        const handleResize = () => {
            setSize({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    return size;
};


export const PresentationView = ({ slides, onClose, aspectRatio }: PresentationViewProps) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const activeSlide = slides[currentIndex];
    const windowSize = useWindowSize();

    const goToNext = useCallback(() => {
        setCurrentIndex((prev) => Math.min(prev + 1, slides.length - 1));
    }, [slides.length]);

    const goToPrev = useCallback(() => {
        setCurrentIndex((prev) => Math.max(prev - 1, 0));
    }, []);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight') goToNext();
            if (e.key === 'ArrowLeft') goToPrev();
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [goToNext, goToPrev, onClose]);

    // --- ПОЛНАЯ РЕАЛИЗАЦИЯ ХУКА useMemo ---
    const slideSize = useMemo(() => {
        const [ratioW, ratioH] = aspectRatio.split(':').map(Number);
        const targetRatio = ratioW / ratioH;

        let width = windowSize.width;
        let height = width / targetRatio;

        if (height > windowSize.height) {
            height = windowSize.height;
            width = height * targetRatio;
        }
        return { width, height };
    }, [windowSize, aspectRatio]);

    const scale = slideSize.width / LOGICAL_WIDTH;
    const [ratioW, ratioH] = aspectRatio.split(':').map(Number);
    const LOGICAL_HEIGHT = LOGICAL_WIDTH / (ratioW / ratioH);

    return (
        <div className="presentation-overlay">
            <Stage width={windowSize.width} height={windowSize.height}>
                <Layer>
                    <Rect x={0} y={0} width={windowSize.width} height={windowSize.height} fill="black" />
                    <Group x={(windowSize.width - slideSize.width) / 2} y={(windowSize.height - slideSize.height) / 2}>
                        <Rect width={slideSize.width} height={slideSize.height} fill="white" />
                        <Group scaleX={scale} scaleY={scale} clipFunc={(ctx) => { ctx.rect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT); }}>
                            {activeSlide.shapes.map((shape: Shape) => {
                                const commonProps = { ...shape, draggable: false };
                                switch (shape.type) {
                                    case 'rect': return <Rect key={shape.id} {...commonProps} />;
                                    case 'circle': return <Ellipse key={shape.id} {...commonProps} radiusX={shape.width / 2} radiusY={shape.height / 2} />;
                                    case 'triangle': return <RegularPolygon key={shape.id} {...commonProps} sides={3} radius={shape.height / 2} scaleX={shape.width / shape.height} />;
                                    case 'text': return <Text key={shape.id} {...commonProps} verticalAlign="middle" fontFamily={(shape as TextShape).fontFamily} />;
                                    case 'image': return <URLImage key={shape.id} shape={shape} {...commonProps} />;
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