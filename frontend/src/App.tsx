// src/App.tsx
import React, { useState, useCallback, useRef, useEffect } from 'react';
import './App.css';
import { v4 as uuidv4 } from 'uuid';
import Konva from 'konva';
import jsPDF from 'jspdf';
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
    const stageRef = useRef<Konva.Stage>(null);

    const activeSlide = slides[activeSlideIndex];
    const selectedShape = activeSlide?.shapes.find((shape) => shape.id === selectedId);

    // --- НОВЫЕ ФУНКЦИИ ---

    const deleteShape = useCallback((shapeId: string) => {
        const newSlides = slides.map((slide, index) => {
            if (index === activeSlideIndex) {
                return {
                    ...slide,
                    shapes: slide.shapes.filter((shape) => shape.id !== shapeId),
                };
            }
            return slide;
        });
        setSlides(newSlides);
        setSelectedId(null);
    }, [slides, activeSlideIndex]);

    const moveShape = useCallback((shapeId: string, direction: 'forward' | 'backward') => {
        const newSlides = [...slides];
        const slide = newSlides[activeSlideIndex];
        const index = slide.shapes.findIndex(s => s.id === shapeId);
        if (index === -1) return;

        const newShapes = [...slide.shapes];
        const [shape] = newShapes.splice(index, 1);

        if (direction === 'forward') {
            newShapes.splice(Math.min(index + 1, newShapes.length), 0, shape);
        } else {
            newShapes.splice(Math.max(index - 1, 0), 0, shape);
        }

        newSlides[activeSlideIndex] = { ...slide, shapes: newShapes };
        setSlides(newSlides);
    }, [slides, activeSlideIndex]);

    // --- КОНЕЦ НОВЫХ ФУНКЦИЙ ---

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

    // --- НОВЫЙ КОД ДЛЯ УДАЛЕНИЯ КЛАВИШЕЙ ---
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
                deleteShape(selectedId);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedId, deleteShape]);

    // --- НОВЫЙ КОД ДЛЯ ЭКСПОРТА PDF ---
    const handleExportPDF = async () => {
        if (!stageRef.current) return;

        const [ratioW, ratioH] = slideAspectRatio.split(':').map(Number);
        const orientation = ratioW > ratioH ? 'l' : 'p'; // l - landscape, p - portrait
        const pdf = new jsPDF(orientation, 'px', [LOGICAL_WIDTH, LOGICAL_HEIGHT]);

        const originalIndex = activeSlideIndex;

        for (let i = 0; i < slides.length; i++) {
            // Временно устанавливаем активный слайд, чтобы он отрендерился
            setActiveSlideIndex(i);

            // Ждем следующего кадра, чтобы React успел обновить DOM
            await new Promise(resolve => setTimeout(resolve, 50));

            const stage = stageRef.current;
            if (stage) {
                const dataUrl = stage.toDataURL({ pixelRatio: 2 }); // Увеличиваем качество
                if (i > 0) {
                    pdf.addPage();
                }
                pdf.addImage(dataUrl, 'PNG', 0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);
            }
        }

        pdf.save('presentation.pdf');

        // Возвращаем исходный активный слайд
        setActiveSlideIndex(originalIndex);
    };

    return (
        <>
            <div className="app-container">
                <div className="left-sidebar">
                    <SlidesPanel slides={slides} activeIndex={activeSlideIndex} onSelectSlide={setActiveSlideIndex} onAddSlide={addSlide} onDeleteSlide={deleteSlide} />
                    <PropertiesPanel shape={selectedShape} onUpdate={updateShape} onDelete={deleteShape} onMove={moveShape} />
                </div>
                <main className="main-content">
                    <TopToolbar onAddShape={addShape} onAddImage={addImageShape} onOpenSettings={() => setIsSettingsOpen(true)} onStartPresentation={() => setIsPresenting(true)} onExportPDF={handleExportPDF} />
                    <PresentationCanvas
                        ref={stageRef}
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