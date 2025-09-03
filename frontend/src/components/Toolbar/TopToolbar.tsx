// src/components/Toolbar/TopToolbar.tsx
import React, { useRef } from 'react';
import './Toolbar.css';

interface TopToolbarProps {
    onAddShape: (type: 'rect' | 'circle' | 'triangle' | 'text') => void;
    onAddImage: (src: string, width: number, height: number) => void;
    onOpenSettings: () => void;
    onStartPresentation: () => void;
}

export const TopToolbar = ({ onAddShape, onAddImage, onOpenSettings, onStartPresentation }: TopToolbarProps) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            const src = reader.result as string;
            const img = new window.Image();
            img.onload = () => { onAddImage(src, img.width, img.height); };
            img.src = src;
        };
        reader.readAsDataURL(file);
        if(fileInputRef.current) { fileInputRef.current.value = ""; }
    };

    return (
        <div className="top-toolbar">
            <div className="shape-buttons">
                <button onClick={() => onAddShape('rect')}>□</button>
                <button onClick={() => onAddShape('circle')}>○</button>
                <button onClick={() => onAddShape('triangle')}>△</button>
                <button onClick={() => onAddShape('text')}>T</button>
                <button onClick={() => fileInputRef.current?.click()}>🖼️</button>
            </div>
            <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*" onChange={handleFileChange} />
            <button className="settings-btn" onClick={onOpenSettings}>⚙️</button>
            <button className="play-btn" onClick={onStartPresentation}>▶</button>
        </div>
    );
};