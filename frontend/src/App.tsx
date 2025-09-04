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
import { SettingsModal } from './components/Settings/SettingsModal';
import { PresentationView } from './components/PresentationView/PresentationView';
import { generateSlides } from './services/api';
import { transformAiResponseToSlides } from './services/dataTransformer';
import { Shape, Slide } from './types';
import { TemplatesPanel } from './components/Sidebar/TemplatesPanel';
import { AiInputBar } from './components/AiInput/AiInputBar';

const LOGICAL_WIDTH = 1280;

// Вспомогательная функция для асинхронной загрузки изображений для PDF экспорта
const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
        const img = new window.Image();
        img.src = src;
        img.crossOrigin = 'Anonymous';
        img.onload = () => resolve(img);
        img.onerror = (err) => reject(err);
    });
};

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
        if (newSlides && newSlides.length > 0) {
            setSlides(newSlides);
            setActiveSlideIndex(0);
            setSelectedId(null);
        } else {
            alert("Не удалось создать слайды из полученных данных.");
        }
    };

    const addSlide = useCallback(() => {
        const newSlide: Slide = { id: uuidv4(), shapes: [] };
        const newSlides = [...slides, newSlide];
        setSlides(newSlides);
        setActiveSlideIndex(newSlides.length - 1);
    }, [slides]);

    const addTemplateSlide = useCallback((templateType: 'title' | 'content' | 'image' | 'final') => {
        let newShapes: Shape[] = [];
        switch (templateType) {
            case 'title':
                newShapes.push({ id: uuidv4(), type: 'text', text: 'Заголовок', fontSize: 80, x: 60, y: 250, width: 1160, height: 120, fill: '#333', rotation: 0, fontFamily: 'Georgia' });
                newShapes.push({ id: uuidv4(), type: 'text', text: 'Подзаголовок', fontSize: 40, x: 60, y: 380, width: 1160, height: 50, fill: '#555', rotation: 0, fontFamily: 'Arial' });
                break;
            case 'content':
                newShapes.push({ id: uuidv4(), type: 'text', text: 'Заголовок', fontSize: 58, x: 50, y: 50, width: 680, height: 70, fill: '#005A9C', rotation: 0, fontFamily: 'Verdana' });
                newShapes.push({ id: uuidv4(), type: 'text', text: '• Ваш текст здесь', fontSize: 32, x: 50, y: 150, width: 680, height: 500, fill: '#333', rotation: 0, fontFamily: 'Arial' });
                break;
            case 'image':
                newShapes.push({ id: uuidv4(), type: 'text', text: 'Заголовок', fontSize: 58, x: 50, y: 50, width: 1180, height: 70, fill: '#333', rotation: 0, fontFamily: 'Verdana' });
                break;
            case 'final':
                newShapes.push({ id: uuidv4(), type: 'text', text: 'Спасибо за внимание!', fontSize: 72, x: 60, y: 300, width: 1160, height: 90, fill: '#333', rotation: 0, fontFamily: 'Georgia' });
                break;
        }
        const newSlide: Slide = { id: uuidv4(), shapes: newShapes };
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
    }, [activeSlideIndex, slideAspectRatio, slides, activeSlideIndex]);

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
                    const parsedData = JSON.parse(result);
                    const slidesToProcess = Array.isArray(parsedData) ? parsedData : parsedData.slides;
                    applyPresentationState(slidesToProcess);
                }
            } catch (error) {
                alert('Ошибка при чтении файла. Убедитесь, что это корректный JSON.');
            }
        };
        reader.readAsText(file);
        if (event.target) event.target.value = '';
    };

    const handleExportPDF = async () => {
        const [ratioW, ratioH] = slideAspectRatio.split(':').map(Number);
        const logicalHeight = LOGICAL_WIDTH / (ratioW / ratioH);
        const orientation = ratioW > ratioH ? 'l' : 'p';
        const pdf = new jsPDF(orientation, 'px', [LOGICAL_WIDTH, logicalHeight]);

        for (let i = 0; i < slides.length; i++) {
            const slide = slides[i];

            const container = document.createElement('div');
            container.style.display = 'none';
            document.body.appendChild(container);

            const stage = new Konva.Stage({
                container: container,
                width: LOGICAL_WIDTH,
                height: logicalHeight,
            });

            const layer = new Konva.Layer();
            layer.add(new Konva.Rect({ x: 0, y: 0, width: LOGICAL_WIDTH, height: logicalHeight, fill: 'white' }));
            stage.add(layer);

            const imageShapes = slide.shapes.filter(s => s.type === 'image');
            const imagePromises = imageShapes.map(s => loadImage((s as any).src));
            const loadedImages = await Promise.all(imagePromises);
            const imagesMap = new Map(imageShapes.map((s, idx) => [(s as any).src, loadedImages[idx]]));

            for (const shape of slide.shapes) {
                let konvaShape;
                switch (shape.type) {
                    case 'rect':
                        konvaShape = new Konva.Rect(shape);
                        break;
                    case 'circle':
                        konvaShape = new Konva.Ellipse({ ...shape, radiusX: shape.width / 2, radiusY: shape.height / 2 });
                        break;
                    case 'triangle':
                        konvaShape = new Konva.RegularPolygon({ ...shape, sides: 3, radius: shape.height / 2, scaleX: shape.width / shape.height });
                        break;
                    case 'text':
                        konvaShape = new Konva.Text({ ...shape, verticalAlign: 'middle' });
                        break;
                    case 'image':
                        const imgElement = imagesMap.get((shape as any).src);
                        if (imgElement) {
                            konvaShape = new Konva.Image({ ...shape, image: imgElement });
                        }
                        break;
                }
                if (konvaShape) {
                    layer.add(konvaShape);
                }
            }

            const dataUrl = stage.toDataURL({ pixelRatio: 2 });

            if (i > 0) {
                pdf.addPage([LOGICAL_WIDTH, logicalHeight], orientation);
            }
            pdf.addImage(dataUrl, 'PNG', 0, 0, LOGICAL_WIDTH, logicalHeight);

            stage.destroy();
            document.body.removeChild(container);
        }

        pdf.save('presentation.pdf');
    };

    const handleAiCommand = async (prompt: string) => {
        setIsLoadingAi(true);
        try {
            const serverResponse = await generateSlides(prompt);
            const newSlides = transformAiResponseToSlides(serverResponse);
            applyPresentationState(newSlides);
        } catch (error) {
            console.error("AI Generation Error:", error);
            alert(error instanceof Error ? error.message : "Произошла ошибка при генерации презентации.");
        } finally {
            setIsLoadingAi(false);
        }
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const target = e.target as HTMLElement;
            if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;
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
                    <PresentationCanvas
                        ref={stageRef}
                        shapes={activeSlide?.shapes || []}
                        selectedId={selectedId}
                        onSelect={setSelectedId}
                        onUpdate={updateShape}
                        aspectRatio={slideAspectRatio}
                    />
                    <AiInputBar onSendCommand={handleAiCommand} isLoading={isLoadingAi} />
                </main>
                <div className="right-sidebar">
                    <TemplatesPanel onAddTemplate={addTemplateSlide} />
                </div>
            </div>
            <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} currentAspectRatio={slideAspectRatio} onAspectRatioChange={setSlideAspectRatio} />
            {isPresenting && <PresentationView slides={slides} onClose={() => setIsPresenting(false)} aspectRatio={slideAspectRatio} />}
        </>
    );
}

export default App;