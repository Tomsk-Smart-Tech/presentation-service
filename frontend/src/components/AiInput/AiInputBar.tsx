import React, { useState } from 'react';
import './AiInputBar.css';

interface AiInputBarProps {
    onSendCommand: (command: string) => void;
    isLoading: boolean;
}

export const AiInputBar = ({ onSendCommand, isLoading }: AiInputBarProps) => {
    const [message, setMessage] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (message.trim() && !isLoading) {
            onSendCommand(message.trim());
            setMessage('');
        }
    };

    return (
        <div className="ai-input-bar-container">
            <form className="ai-input-form" onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder={isLoading ? "ИИ генерирует презентацию..." : "Введите тему для презентации..."}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    disabled={isLoading}
                />
                <button type="submit" disabled={isLoading}>
                    {isLoading ? '...' : '➢'}
                </button>
            </form>
        </div>
    );
};