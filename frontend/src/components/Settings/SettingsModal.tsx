import React from 'react';
import './SettingsModal.css';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentAspectRatio: string;
    onAspectRatioChange: (ratio: string) => void;
}

export const SettingsModal = ({ isOpen, onClose, currentAspectRatio, onAspectRatioChange }: SettingsModalProps) => {
    if (!isOpen) {
        return null;
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h2>Параметры слайда</h2>
                <div className="setting-group">
                    <label>Соотношение сторон</label>
                    <div className="button-group">
                        <button
                            className={currentAspectRatio === '16:9' ? 'active' : ''}
                            onClick={() => onAspectRatioChange('16:9')}
                        >
                            16:9 (Широкий)
                        </button>
                        <button
                            className={currentAspectRatio === '4:3' ? 'active' : ''}
                            onClick={() => onAspectRatioChange('4:3')}
                        >
                            4:3 (Стандартный)
                        </button>
                    </div>
                </div>
                <button className="close-button" onClick={onClose}>Закрыть</button>
            </div>
        </div>
    );
};