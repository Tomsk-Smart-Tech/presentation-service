import React from 'react';
import './Sidebar.css';

export const SlidesPanel = () => {
    const slides = ['Слайд 1', 'Слайд 2', 'Слайд 3']; // Временные данные

    return (
        <div className="panel">
            <div className="panel-header">
                <h3>Слайды</h3>
                <button className="add-btn">+</button>
            </div>
            <ul className="slides-list">
                {slides.map((slide, index) => (
                    <li key={index} className="slide-item">
                        {slide}
                        <button className="delete-btn">-</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};