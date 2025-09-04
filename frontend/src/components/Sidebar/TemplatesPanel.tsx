import React from 'react';
import './Sidebar.css';

interface TemplatesPanelProps {
    onAddTemplate: (templateType: 'title' | 'content' | 'image' | 'final') => void;
}

export const TemplatesPanel = ({ onAddTemplate }: TemplatesPanelProps) => {
    return (
        <div className="panel templates-panel">
            <h3>Шаблоны слайдов</h3>
            <ul className="templates-list">
                <li onClick={() => onAddTemplate('title')}>
                    <h4>Титульный слайд</h4>
                    <p>Заголовок и подзаголовок</p>
                </li>
                <li onClick={() => onAddTemplate('content')}>
                    <h4>Контентный слайд</h4>
                    <p>Заголовок, текст и изображение</p>
                </li>
                <li onClick={() => onAddTemplate('image')}>
                    <h4>Слайд с изображением</h4>
                    <p>Заголовок и большое изображение</p>
                </li>
                <li onClick={() => onAddTemplate('final')}>
                    <h4>Финальный слайд</h4>
                    <p>Заключительная фраза</p>
                </li>
            </ul>
        </div>
    );
};