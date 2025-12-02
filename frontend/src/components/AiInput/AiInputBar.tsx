import React, { useState } from 'react';
import './AiInputBar.css';

/**
 * Props for the AiInputBar component.
 */
interface AiInputBarProps {
    /** Callback to execute when a command is sent. */
    onSendCommand: (command: string) => void;
    /** Whether the AI is currently processing a request. */
    isLoading: boolean;
}

/**
 * A floating input bar for sending prompts to the AI assistant.
 *
 * @param {AiInputBarProps} props - The component props.
 * @returns {JSX.Element} The rendered AiInputBar component.
 */
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