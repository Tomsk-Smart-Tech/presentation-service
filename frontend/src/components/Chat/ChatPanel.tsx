import React, { useState } from 'react';
import './Chat.css';

interface ChatPanelProps {
    onSendCommand: (command: string) => void;
}

export const ChatPanel = ({ onSendCommand }: ChatPanelProps) => {
    const [message, setMessage] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (message.trim()) {
            onSendCommand(message.trim());
            setMessage('');
        }
    };

    return (
        <div className="chat-panel">
            <h3 className="chat-header">Чат с ИИ ассистентом</h3>
            <div className="chat-messages">
                <p className="chat-placeholder">Введите запрос для генерации презентации. Например: "презентация про кошек"</p>
            </div>
            <form className="chat-input-form" onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Введите запрос..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                />
                <button type="submit">➢</button>
            </form>
        </div>
    );
};