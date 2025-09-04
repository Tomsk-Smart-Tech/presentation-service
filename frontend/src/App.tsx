import React, { useState, useCallback, useRef, useEffect } from 'react';
import './App.css';
import { v4 as uuidv4 } from 'uuid';
import Konva from 'konva';
import jsPDF from 'jspdf';
import { LoginPage } from './components/Login/LoginPage';
import { SlidesPanel } from './components/Sidebar/SlidesPanel';
import { PropertiesPanel } from './components/Sidebar/PropertiesPanel';
import { TopToolbar } from './components/Toolbar/TopToolbar';
import { PresentationCanvas } from './components/Canvas/PresentationCanvas';
import { ChatPanel } from './components/Chat/ChatPanel';
import { SettingsModal } from './components/Settings/SettingsModal';
import { PresentationView } from './components/PresentationView/PresentationView';
import { mockAiApiCall } from './ai/mockApi';
import { Shape, Slide } from './types';

const LOGICAL_WIDTH = 1280;

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [slides, setSlides] = useState<Slide[]>([{ id: uuidv4(), shapes: [] }]);
    const [activeSlideIndex, setActiveSlideIndex] = useState(0);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [slideAspectRatio, setSlideAspectRatio] = useState('16:9');
    const [isPresenting, setIsPresenting] = useState(false);
    const [isLoadingAi, setIsLoadingAi] = useState(false);
    const stageRef = useRef<Konva.Stage>(null);
    const jsonInputRef = useRef<HTMLInputElement>(null);
    const activeSlide = slides[activeSlideIndex];
    const selectedShape = activeSlide?.shapes.find((shape) => shape.id === selectedId);

    const handleLoginSuccess = () => setIsAuthenticated(true);

    const applyPresentationState = (newSlides: Slide[]) => {
        if (Array.isArray(newSlides) && newSlides.length > 0) {
            setSlides(newSlides);
            setActiveSlideIndex(0);
            setSelectedId(null);
        } else {
            alert("Ошибка: Некорректный формат данных для презентации.");
        }
    };

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

    const addShape = useCallback((type: 'rect' | 'circle' | 'triangle' | 'text' | 'image', payload?: any) => {
        const [ratioW, ratioH] = slideAspectRatio.split(':').map(Number);
        const logicalHeight = LOGICAL_WIDTH / (ratioW / ratioH);
        const commonProps = { id: uuidv4(), x: LOGICAL_WIDTH / 2 - 150, y: logicalHeight / 2 - 100, rotation: 0 };
        let newShape: Shape;
        switch (type) {
            case 'rect': newShape = { ...commonProps, type, width: 150, height: 100, fill: '#8BC34A' }; break;
            case 'circle': newShape = { ...commonProps, type, width: 120, height: 120, fill: '#2196F3' }; break;
            case 'triangle': newShape = { ...commonProps, type, width: 120, height: 100, fill: '#FFC107' }; break;
            case 'text':
                const fontSize = 48;
                newShape = { ...commonProps, type, text: 'Новый текст', fontSize, width: 300, height: fontSize * 1.2, fill: '#673AB7', fontFamily: 'Arial' }; break;
            case 'image': newShape = { ...commonProps, type, ...payload, fill: '' }; break;
        }
        setSlides(slides => slides.map((slide, index) => index === activeSlideIndex ? { ...slide, shapes: [...slide.shapes, newShape] } : slide));
    }, [activeSlideIndex, slideAspectRatio]);

    const updateShape = useCallback((shapeId: string, newAttrs: Partial<Shape>) => {
        setSlides(slides => slides.map((slide, index) => {
            if (index === activeSlideIndex) {
                return { ...slide, shapes: slide.shapes.map((shape) => shape.id === shapeId ? { ...shape, ...newAttrs } as Shape : shape) };
            }
            return slide;
        }));
    }, [activeSlideIndex]);

    const deleteShape = useCallback((shapeId: string) => {
        setSlides(slides => slides.map((slide, index) => {
            if (index === activeSlideIndex) {
                return { ...slide, shapes: slide.shapes.filter((shape) => shape.id !== shapeId) };
            }
            return slide;
        }));
        setSelectedId(null);
    }, [activeSlideIndex]);

    const moveShape = useCallback((shapeId: string, direction: 'forward' | 'backward') => {
        setSlides(slides => {
            const newSlides = [...slides];
            const slide = newSlides[activeSlideIndex];
            const index = slide.shapes.findIndex(s => s.id === shapeId);
            if (index === -1) return slides;
            const newShapes = [...slide.shapes];
            const [shape] = newShapes.splice(index, 1);
            if (direction === 'forward') {
                newShapes.splice(Math.min(index + 1, newShapes.length), 0, shape);
            } else {
                newShapes.splice(Math.max(index - 1, 0), 0, shape);
            }
            newSlides[activeSlideIndex] = { ...slide, shapes: newShapes };
            return newSlides;
        });
    }, [activeSlideIndex]);

    const addImageShape = useCallback((src: string, width: number, height: number) => {
        const MAX_WIDTH = LOGICAL_WIDTH / 4;
        const scale = MAX_WIDTH / width;
        addShape('image', { src, width: width * scale, height: height * scale });
    }, [addShape]);

    const handleExportJSON = () => {
        const dataStr = JSON.stringify(slides, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', 'presentation.json');
        linkElement.click();
    };

    const handleImportJSON = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const result = e.target?.result;
                if (typeof result === 'string') {
                    applyPresentationState(JSON.parse(result));
                }
            } catch (error) {
                alert('Ошибка при чтении файла. Убедитесь, что это корректный JSON.');
            }
        };
        reader.readAsText(file);
        if (event.target) event.target.value = '';
    };

    const handleExportPDF = async () => {
        if (!stageRef.current) return;
        const [ratioW, ratioH] = slideAspectRatio.split(':').map(Number);
        const logicalHeight = LOGICAL_WIDTH / (ratioW / ratioH);
        const orientation = ratioW > ratioH ? 'l' : 'p';
        const pdf = new jsPDF(orientation, 'px', [LOGICAL_WIDTH, logicalHeight]);
        const originalIndex = activeSlideIndex;
        setSelectedId(null);
        for (let i = 0; i < slides.length; i++) {
            setActiveSlideIndex(i);
            await new Promise(resolve => setTimeout(resolve, 100));
            const stage = stageRef.current;
            if (stage) {
                const dataUrl = stage.toDataURL({ pixelRatio: 2 });
                if (i > 0) {
                    pdf.addPage([LOGICAL_WIDTH, logicalHeight], orientation);
                }
                pdf.addImage(dataUrl, 'PNG', 0, 0, LOGICAL_WIDTH, logicalHeight);
            }
        }
        pdf.save('presentation.pdf');
        setActiveSlideIndex(originalIndex);
    };

    const handleAiCommand = async (prompt: string) => {
        setIsLoadingAi(true);
        try {
            const newSlides = await mockAiApiCall(prompt);
            applyPresentationState(newSlides);
        } catch (error) {
            console.error("AI Generation Error:", error);
            alert("Произошла ошибка при генерации презентации.");
        } finally {
            setIsLoadingAi(false);
        }
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const target = e.target as HTMLElement;
            if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
                return;
            }
            if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
                deleteShape(selectedId);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedId, deleteShape]);

    if (!isAuthenticated) {
        return <LoginPage onLoginSuccess={handleLoginSuccess} />;
    }

    return (
        <>
            {isLoadingAi && (
                <div className="loading-overlay">
                    <div className="loading-spinner"></div>
                    <p>AI генерирует презентацию...</p>
                </div>
            )}
            <div className="app-container">
                <div className="left-sidebar">
                    <SlidesPanel slides={slides} activeIndex={activeSlideIndex} onSelectSlide={setActiveSlideIndex} onAddSlide={addSlide} onDeleteSlide={deleteSlide} />
                    <PropertiesPanel shape={selectedShape} onUpdate={updateShape} onDelete={deleteShape} onMove={moveShape} />
                </div>
                <main className="main-content">
                    <TopToolbar
                        onAddShape={addShape}
                        onAddImage={addImageShape}
                        onOpenSettings={() => setIsSettingsOpen(true)}
                        onStartPresentation={() => setIsPresenting(true)}
                        onExportPDF={handleExportPDF}
                        onExportJSON={handleExportJSON}
                        onImportJSON={() => jsonInputRef.current?.click()}
                    />
                    <input type="file" ref={jsonInputRef} style={{ display: 'none' }} accept="application/json" onChange={handleImportJSON} />
                    <PresentationCanvas
                        ref={stageRef}
                        shapes={activeSlide?.shapes || []}
                        selectedId={selectedId}
                        onSelect={setSelectedId}
                        onUpdate={updateShape}
                        aspectRatio={slideAspectRatio}
                    />
                </main>
                <div className="right-sidebar">
                    <ChatPanel onSendCommand={handleAiCommand} />
                </div>
            </div>
            <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} currentAspectRatio={slideAspectRatio} onAspectRatioChange={setSlideAspectRatio} />
            {isPresenting && <PresentationView slides={slides} onClose={() => setIsPresenting(false)} aspectRatio={slideAspectRatio} />}
        </>
    );
}

export default App;