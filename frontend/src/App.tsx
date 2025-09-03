import React, { useState } from 'react';
import './App.css';
import { v4 as uuidv4 } from 'uuid'; // Импортируем генератор ID

import { SlidesPanel } from './components/Sidebar/SlidesPanel';
import { PropertiesPanel } from './components/Sidebar/PropertiesPanel';
import { TopToolbar } from './components/Toolbar/TopToolbar';
import { PresentationCanvas } from './components/Canvas/PresentationCanvas';
import { ChatPanel } from './components/Chat/ChatPanel';
import { Shape } from './components/Canvas/shapes'; // Импортируем наш тип

function App() {
  // Состояние для всех фигур на холсте
  const [shapes, setShapes] = useState<Shape[]>([]);
  // Состояние для ID выбранной фигуры
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleAddShape = (type: 'rect' | 'text') => {
    let newShape;
    const commonProps = { id: uuidv4(), x: 50, y: 50, fill: '#ff8a65' };

    if (type === 'rect') {
      newShape = {
        ...commonProps,
        type: 'rect',
        width: 100,
        height: 100,
      } as Shape;
    } else {
      newShape = {
        ...commonProps,
        type: 'text',
        text: 'Новый текст',
        fontSize: 24,
        fontFamily: 'Arial',
      } as Shape;
    }

    setShapes([...shapes, newShape]);
  };

  const handleShapeUpdate = (id: string, newAttrs: Partial<Shape>) => {
    setShapes(
        shapes.map((shape) => {
          if (shape.id === id) {
            return { ...shape, ...newAttrs };
          }
          return shape;
        })
    );
  };

  const selectedShape = shapes.find((shape) => shape.id === selectedId);

  return (
      <div className="app-container">
        <div className="left-sidebar">
          <SlidesPanel />
          <PropertiesPanel
              shape={selectedShape}
              onUpdate={handleShapeUpdate}
          />
        </div>
        <main className="main-content">
          <TopToolbar onAddShape={handleAddShape} />
          <PresentationCanvas
              shapes={shapes}
              selectedId={selectedId}
              onSelect={setSelectedId}
              onUpdate={handleShapeUpdate}
          />
        </main>
        <div className="right-sidebar">
          <ChatPanel />
        </div>
      </div>
  );
}

export default App;