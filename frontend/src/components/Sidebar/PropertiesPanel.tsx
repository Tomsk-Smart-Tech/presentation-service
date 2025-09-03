import React from 'react';
import './Sidebar.css';
import { Shape } from '../Canvas/shapes';

interface PropertiesPanelProps {
    shape: Shape | undefined;
    onUpdate: (id: string, newAttrs: Partial<Shape>) => void;
}

export const PropertiesPanel = ({ shape, onUpdate }: PropertiesPanelProps) => {
    if (!shape) {
        return (
            <div className="panel">
                <h3>Свойства объекта</h3>
                <p>Ничего не выбрано</p>
            </div>
        );
    }

    const handleCommonChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onUpdate(shape.id, { [e.target.name]: e.target.value });
    };

    const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onUpdate(shape.id, { [e.target.name]: Number(e.target.value) });
    };

    return (
        <div className="panel properties-panel">
            <h3>Свойства объекта</h3>
            <div className="prop-item">
                <label>Цвет</label>
                <input
                    type="color"
                    name="fill"
                    value={shape.fill}
                    onChange={handleCommonChange}
                />
            </div>

            {shape.type === 'text' && (
                <>
                    <div className="prop-item">
                        <label>Шрифт</label>
                        <input
                            type="number"
                            name="fontSize"
                            value={shape.fontSize}
                            onChange={handleNumberChange}
                        />
                    </div>
                    <div className="prop-item">
                        <label>Текст</label>
                        <input
                            type="text"
                            name="text"
                            value={shape.text}
                            onChange={handleCommonChange}
                        />
                    </div>
                </>
            )}
        </div>
    );
};