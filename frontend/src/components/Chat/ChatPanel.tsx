import React from 'react';
import './Chat.css';

export const ChatPanel = () => {
    return (
        <div className="chat-panel">
            <h3 className="chat-header">Чат с ИИ ассистентом</h3>
            <div className="chat-messages">
                {}
            </div>
            <div className="chat-input">
                <input type="text" placeholder="Введите запрос" />
                <button>➢</button>
            </div>
        </div>
    );
};