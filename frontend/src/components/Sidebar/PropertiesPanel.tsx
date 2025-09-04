import React from 'react';
import './Sidebar.css';
import { Shape, TextShape } from '../../types';

// Вспомогательная функция для измерения ширины текста.
// Мы используем 2D-контекст HTML-канваса для точного расчета.
let canvasContext: CanvasRenderingContext2D | null = null;
const getTextWidth = (text: string, fontSize: number, fontFamily: string) => {
    if (!canvasContext) {
        const canvas = document.createElement('canvas');
        canvasContext = canvas.getContext('2d');
    }
    if (canvasContext) {
        canvasContext.font = `${fontSize}px ${fontFamily}`;
        return canvasContext.measureText(text).width;
    }
    return text.length * fontSize * 0.6; // Fallback
};


interface PropertiesPanelProps {
    shape: Shape | undefined;
    onUpdate: (id: string, newAttrs: Partial<Shape>) => void;
    onDelete: (id: string) => void;
    onMove: (id: string, direction: 'forward' | 'backward') => void;
}

export const PropertiesPanel = ({ shape, onUpdate, onDelete, onMove }: PropertiesPanelProps) => {
    if (!shape) {
        return ( <div className="panel properties-panel"><h3>Свойства объекта</h3><p>Ничего не выбрано</p></div> );
    }

    const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onUpdate(shape.id, { [e.target.name]: Number(e.target.value) });
    };

    const handlePropertyChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        onUpdate(shape.id, { [e.target.name]: e.target.value });
    };

    // Специальный обработчик для изменения текста, который также меняет ширину
    const handleTextContentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newText = e.target.value;
        const textShape = shape as TextShape;

        // Рассчитываем новую ширину на основе текста, размера и семейства шрифта
        const newWidth = getTextWidth(newText, textShape.fontSize, textShape.fontFamily);

        // Обновляем и текст, и ширину. Добавляем небольшой запас.
        onUpdate(shape.id, {
            text: newText,
            width: newWidth + textShape.fontSize * 0.5,
        });
    };


    return (
        <div className="panel properties-panel">
            <h3>Свойства ({shape.type})</h3>
            <div className="prop-group">
                <div className="prop-item"><label>X</label><input type="number" name="x" value={Math.round(shape.x)} onChange={handleNumberChange} /></div>
                <div className="prop-item"><label>Y</label><input type="number" name="y" value={Math.round(shape.y)} onChange={handleNumberChange} /></div>
            </div>

            {(shape.type !== 'text') && (
                <div className="prop-group">
                    <div className="prop-item"><label>Ширина</label><input type="number" name="width" value={Math.round(shape.width)} onChange={handleNumberChange} /></div>
                    <div className="prop-item"><label>Высота</label><input type="number" name="height" value={Math.round(shape.height)} onChange={handleNumberChange} /></div>
                </div>
            )}

            <div className="prop-group">
                <div className="prop-item"><label>Поворот</label><input type="number" name="rotation" value={Math.round(shape.rotation)} onChange={handleNumberChange} /></div>
                {shape.type !== 'image' && (
                    <div className="prop-item"><label>Цвет</label><input type="color" name="fill" value={shape.fill} onChange={handlePropertyChange} /></div>
                )}
            </div>

            {shape.type === 'text' && (
                <>
                    <div className="prop-group">
                        <div className="prop-item wide"><label>Текст</label><input type="text" name="text" value={(shape as TextShape).text} onChange={handleTextContentChange} /></div>
                    </div>
                    <div className="prop-group">
                        <div className="prop-item"><label>Размер</label><input type="number" name="fontSize" value={(shape as TextShape).fontSize} onChange={handleNumberChange} /></div>
                        {/* --- НОВЫЙ ЭЛЕМЕНТ: ВЫБОР ШРИФТА --- */}
                        <div className="prop-item"><label>Шрифт</label>
                            <select name="fontFamily" value={(shape as TextShape).fontFamily} onChange={handlePropertyChange}>
                                <option value="Arial">Arial</option>
                                <option value="Verdana">Verdana</option>
                                <option value="Georgia">Georgia</option>
                                <option value="Times New Roman">Times New Roman</option>
                                <option value="Courier New">Courier New</option>
                            </select>
                        </div>
                    </div>
                </>
            )}

            <div className="prop-group prop-group-buttons">
                <button onClick={() => onMove(shape.id, 'backward')}>Назад</button>
                <button onClick={() => onMove(shape.id, 'forward')}>Вперед</button>
            </div>

            <button className="delete-button" onClick={() => onDelete(shape.id)}>Удалить объект</button>
        </div>
    );
};