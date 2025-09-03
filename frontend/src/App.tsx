// src/App.tsx
import React, { useState, useCallback } from 'react';
import './App.css';
import { v4 as uuidv4 } from 'uuid';
import { SlidesPanel } from './components/Sidebar/SlidesPanel';
import { PropertiesPanel } from './components/Sidebar/PropertiesPanel';
import { TopToolbar } from './components/Toolbar/TopToolbar';
import { PresentationCanvas } from './components/Canvas/PresentationCanvas';
import { ChatPanel } from './components/Chat/ChatPanel';
import { SettingsModal } from './components/Settings/SettingsModal';
import { PresentationView } from './components/PresentationView/PresentationView';
import { Shape, Slide } from './types';

const LOGICAL_WIDTH = 1280;
const LOGICAL_HEIGHT = 720;

function App() {
    const [slides, setSlides] = useState<Slide[]>([{ id: uuidv4(), shapes: [] }]);
    const [activeSlideIndex, setActiveSlideIndex] = useState(0);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [slideAspectRatio, setSlideAspectRatio] = useState('16:9');
    const [isPresenting, setIsPresenting] = useState(false);

    const activeSlide = slides[activeSlideIndex];
    const selectedShape = activeSlide?.shapes.find((shape) => shape.id === selectedId);

    const addSlide = useCallback(() => {
        const newSlide: Slide = { id: uuidv4(), shapes: [] };
        const newSlides = [...slides, newSlide];
        setSlides(newSlides);
        setActiveSlideIndex(newSlides.length - 1);
    }, [slides]);

    const deleteSlide = useCallback((idToDelete: string) => {
        if (slides.length <= 1) return;
        const newSlides = slides.filter((slide) => slide.id !== idToDelete);
        setSlides(newSlides);
        setActiveSlideIndex((prev) => Math.min(prev, newSlides.length - 1));
    }, [slides]);

    const updateShape = useCallback((shapeId: string, newAttrs: Partial<Shape>) => {
        const newSlides = slides.map((slide, index) => {
            if (index === activeSlideIndex) {
                return {
                    ...slide,
                    shapes: slide.shapes.map((shape) =>
                        shape.id === shapeId ? { ...shape, ...newAttrs } as Shape : shape
                    ),
                };
            }
            return slide;
        });
        setSlides(newSlides);
    }, [slides, activeSlideIndex]);

    const addShape = useCallback((type: 'rect' | 'circle' | 'triangle' | 'text' | 'image', payload?: any) => {
        const commonProps = { id: uuidv4(), x: LOGICAL_WIDTH / 2 - 75, y: LOGICAL_HEIGHT / 2 - 50, rotation: 0 };
        let newShape: Shape;

        switch (type) {
            case 'rect': newShape = { ...commonProps, type, width: 150, height: 100, fill: '#8BC34A' }; break;
            case 'circle': newShape = { ...commonProps, type, width: 120, height: 120, fill: '#2196F3' }; break;
            case 'triangle': newShape = { ...commonProps, type, width: 120, height: 100, fill: '#FFC107' }; break;
            case 'text':
                const fontSize = 48;
                newShape = { ...commonProps, type, text: 'Новый текст', fontSize, width: 300, height: fontSize * 1.2, fill: '#673AB7' };
                break;
            case 'image':
                newShape = { ...commonProps, type, ...payload, fill: '' };
                break;
        }

        const newSlides = slides.map((slide, index) =>
            index === activeSlideIndex ? { ...slide, shapes: [...slide.shapes, newShape] } : slide
        );
        setSlides(newSlides);
    }, [slides, activeSlideIndex]);

    const addImageShape = useCallback((src: string, width: number, height: number) => {
        const MAX_WIDTH = LOGICAL_WIDTH / 4;
        const scale = MAX_WIDTH / width;
        addShape('image', { src, width: width * scale, height: height * scale });
    }, [addShape]);

    return (
        <>
            <div className="app-container">
                <div className="left-sidebar">
                    <SlidesPanel slides={slides} activeIndex={activeSlideIndex} onSelectSlide={setActiveSlideIndex} onAddSlide={addSlide} onDeleteSlide={deleteSlide} />
                    <PropertiesPanel shape={selectedShape} onUpdate={updateShape} />
                </div>
                <main className="main-content">
                    <TopToolbar onAddShape={addShape} onAddImage={addImageShape} onOpenSettings={() => setIsSettingsOpen(true)} onStartPresentation={() => setIsPresenting(true)} />
                    <PresentationCanvas
                        shapes={activeSlide?.shapes || []} selectedId={selectedId} onSelect={setSelectedId}
                        onUpdate={updateShape} aspectRatio={slideAspectRatio}
                    />
                </main>
                <div className="right-sidebar"><ChatPanel /></div>
            </div>
            <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} currentAspectRatio={slideAspectRatio} onAspectRatioChange={setSlideAspectRatio} />
            {isPresenting && <PresentationView slides={slides} onClose={() => setIsPresenting(false)} aspectRatio={slideAspectRatio} />}
        </>
    );
}

export default App;