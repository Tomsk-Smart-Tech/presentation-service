import React from 'react';
import './SettingsModal.css';

/**
 * Props for the SettingsModal component.
 */
interface SettingsModalProps {
    /** Whether the modal is visible. */
    isOpen: boolean;
    /** Callback to close the modal. */
    onClose: () => void;
    /** The current aspect ratio of the slides (e.g., '16:9'). */
    currentAspectRatio: string;
    /** Callback to update the aspect ratio. */
    onAspectRatioChange: (ratio: string) => void;
}

/**
 * A modal dialog for configuring global presentation settings.
 *
 * Currently supports changing the slide aspect ratio.
 *
 * @param {SettingsModalProps} props - The component props.
 * @returns {JSX.Element | null} The rendered SettingsModal component, or null if not open.
 */
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