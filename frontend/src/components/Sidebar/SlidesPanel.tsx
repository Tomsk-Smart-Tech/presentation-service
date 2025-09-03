// src/components/Sidebar/SlidesPanel.tsx
import React from 'react';
import './Sidebar.css';
import { Slide } from '../../types';

interface SlidesPanelProps {
    slides: Slide[];
    activeIndex: number;
    onSelectSlide: (index: number) => void;
    onAddSlide: () => void;
    onDeleteSlide: (id: string) => void;
}

export const SlidesPanel = ({ slides, activeIndex, onSelectSlide, onAddSlide, onDeleteSlide }: SlidesPanelProps) => {
    return (
        <div className="panel">
            <div className="panel-header"><h3>Слайды</h3><button className="add-btn" onClick={onAddSlide}>+</button></div>
            <ul className="slides-list">
                {slides.map((slide, index) => (
                    <li key={slide.id} className={`slide-item ${index === activeIndex ? 'active' : ''}`} onClick={() => onSelectSlide(index)}>
                        Слайд {index + 1}
                        <button className="delete-btn" onClick={(e) => { e.stopPropagation(); onDeleteSlide(slide.id); }}>-</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};