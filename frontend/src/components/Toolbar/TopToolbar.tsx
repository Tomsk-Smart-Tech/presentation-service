import React from 'react';
import './Toolbar.css';

interface TopToolbarProps {
    onAddShape: (type: 'rect' | 'text') => void;
}

export const TopToolbar = ({ onAddShape }: TopToolbarProps) => {
    return (
        <div className="top-toolbar">
            <div className="shape-buttons">
                <button onClick={() => onAddShape('rect')}>□</button>
                <button>○</button>
                <button>△</button>
                <button onClick={() => onAddShape('text')}>T</button>
            </div>
            <button className="play-btn">▶</button>
        </div>
    );
};