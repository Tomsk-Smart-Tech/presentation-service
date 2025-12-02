import React, { useState } from 'react';
import './Chat.css';

/**
 * Props for the ChatPanel component.
 */
interface ChatPanelProps {
    /** Callback function to handle the command sent by the user. */
    onSendCommand: (command: string) => void;
}

/**
 * A chat interface component for interacting with the AI assistant.
 *
 * Allows the user to type and send text prompts for slide generation.
 *
 * @param {ChatPanelProps} props - The component props.
 * @returns {JSX.Element} The rendered ChatPanel component.
 */
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