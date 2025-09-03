// src/components/Toolbar/TopToolbar.tsx
import React, { useRef } from 'react';
import './Toolbar.css';

interface TopToolbarProps {
    onAddShape: (type: 'rect' | 'circle' | 'triangle' | 'text') => void;
    onAddImage: (src: string, width: number, height: number) => void;
    onOpenSettings: () => void;
    onStartPresentation: () => void;
    onExportPDF: () => void;
}

export const TopToolbar = ({ onAddShape, onAddImage, onOpenSettings, onStartPresentation, onExportPDF }: TopToolbarProps) => {
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

    const SvgIcon = ({ path }: { path: React.ReactNode }) => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {path}
        </svg>
    );

    return (
        <div className="top-toolbar">
            <div className="shape-buttons">
                <button onClick={() => onAddShape('rect')} title="Прямоугольник">
                    <SvgIcon path={<path d="M3 3h18v18H3z" />} />
                </button>
                <button onClick={() => onAddShape('circle')} title="Круг">
                    <SvgIcon path={<circle cx="12" cy="12" r="10" />} />
                </button>
                <button onClick={() => onAddShape('triangle')} title="Треугольник">
                    <SvgIcon path={<path d="M12 2L2 22h20L12 2z" />} />
                </button>
                {/* --- 👇 ИЗМЕНЕНИЕ ЗДЕСЬ --- */}
                <button onClick={() => onAddShape('text')} title="Текст">
                    <SvgIcon path={<path d="M3 3h18M12 3v18" />} />
                </button>
                <button onClick={() => fileInputRef.current?.click()} title="Изображение">
                    <SvgIcon path={<><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></>} />
                </button>
            </div>
            <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*" onChange={handleFileChange} />

            <button className="export-btn" onClick={onExportPDF} title="Экспорт в PDF">PDF</button>

            <button className="settings-btn" onClick={onOpenSettings} title="Настройки">
                <SvgIcon path={<><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></>} />
            </button>
            <button className="play-btn" onClick={onStartPresentation} title="Начать презентацию">
                <SvgIcon path={<polygon points="5 3 19 12 5 21 5 3"></polygon>} />
            </button>
        </div>
    );
};