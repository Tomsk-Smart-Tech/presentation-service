// src/components/Sidebar/PropertiesPanel.tsx
import React from 'react';
import './Sidebar.css';
// FIX: Убеждаемся, что импорт идет из правильного файла
import { Shape, TextShape } from '../../types';

interface PropertiesPanelProps {
    shape: Shape | undefined;
    onUpdate: (id: string, newAttrs: Partial<Shape>) => void;
}

export const PropertiesPanel = ({ shape, onUpdate }: PropertiesPanelProps) => {
    if (!shape) {
        return (
            <div className="panel"><h3>Свойства объекта</h3><p>Ничего не выбрано</p></div>
        );
    }

    const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onUpdate(shape.id, { [e.target.name]: Number(e.target.value) });
    };

    const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onUpdate(shape.id, { [e.target.name]: e.target.value });
    };

    return (
        <div className="panel properties-panel">
            <h3>Свойства ({shape.type})</h3>

            <div className="prop-group">
                <div className="prop-item"><label>X</label><input type="number" name="x" value={Math.round(shape.x)} onChange={handleNumberChange} /></div>
                <div className="prop-item"><label>Y</label><input type="number" name="y" value={Math.round(shape.y)} onChange={handleNumberChange} /></div>
            </div>

            <div className="prop-group">
                {shape.type !== 'text' && (
                    <>
                        <div className="prop-item"><label>Ширина</label><input type="number" name="width" value={Math.round(shape.width)} onChange={handleNumberChange} /></div>
                        <div className="prop-item"><label>Высота</label><input type="number" name="height" value={Math.round(shape.height)} onChange={handleNumberChange} /></div>
                    </>
                )}
            </div>

            <div className="prop-group">
                <div className="prop-item"><label>Поворот</label><input type="number" name="rotation" value={Math.round(shape.rotation)} onChange={handleNumberChange} /></div>
                {shape.type !== 'image' && (
                    <div className="prop-item"><label>Цвет</label><input type="color" name="fill" value={shape.fill} onChange={handleTextChange} /></div>
                )}
            </div>

            {shape.type === 'text' && (
                <div className="prop-group">
                    <div className="prop-item wide"><label>Текст</label><input type="text" name="text" value={(shape as TextShape).text} onChange={handleTextChange} /></div>
                    <div className="prop-item"><label>Размер</label><input type="number" name="fontSize" value={(shape as TextShape).fontSize} onChange={handleNumberChange} /></div>
                </div>
            )}
        </div>
    );
};