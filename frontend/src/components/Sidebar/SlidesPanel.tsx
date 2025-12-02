import React from 'react';
import './Sidebar.css';
import { Slide } from '../../types';

/**
 * Props for the SlidesPanel component.
 */
interface SlidesPanelProps {
    /** The list of all slides in the presentation. */
    slides: Slide[];
    /** The index of the currently active/displayed slide. */
    activeIndex: number;
    /** Callback to change the active slide. */
    onSelectSlide: (index: number) => void;
    /** Callback to add a new blank slide. */
    onAddSlide: () => void;
    /** Callback to delete a specific slide by ID. */
    onDeleteSlide: (id: string) => void;
}

/**
 * A sidebar panel displaying a list of slides in the presentation.
 *
 * Allows navigation between slides, adding new slides, and deleting existing ones.
 *
 * @param {SlidesPanelProps} props - The component props.
 * @returns {JSX.Element} The rendered SlidesPanel component.
 */
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