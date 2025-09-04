import React, { useEffect, useState } from 'react';
import './Notification.css';

export interface NotificationProps {
    message: string;
    type: 'success' | 'error';
    onClose: () => void;
}

export const Notification = ({ message, type, onClose }: NotificationProps) => {
    const [visible, setVisible] = useState(false);

    // Эффект для появления и исчезновения
    useEffect(() => {
        // Появление
        setVisible(true);

        // Устанавливаем таймер на исчезновение
        const timer = setTimeout(() => {
            setVisible(false);
            // Даем время на анимацию затухания перед полным удалением
            setTimeout(onClose, 300); // 300ms - время анимации
        }, 3000); // Уведомление будет видно 3 секунды

        // Очищаем таймер, если компонент размонтируется раньше
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className={`notification-container ${type} ${visible ? 'visible' : ''}`}>
            {message}
        </div>
    );
};