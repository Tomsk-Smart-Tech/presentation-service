import React, { useState } from 'react';
import './Login.css';
import { loginUser } from '../../services/api';

interface LoginPageProps {
    onLoginSuccess: () => void;
}

export const LoginPage = ({ onLoginSuccess }: LoginPageProps) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const data = await loginUser(username, password);
            if (data && data.role) {
                onLoginSuccess();
            } else {
                setError('Неверный ответ от сервера');
                console.log(data);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Произошла неизвестная ошибка');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="welcome-page-container">
            <header className="welcome-header">
                <h1>SMART SLIDES</h1>
            </header>
            <main className="welcome-main">
                <div className="welcome-info">
                    <h2>Создавайте презентации будущего.</h2>
                    <p>
                        Используйте мощь искусственного интеллекта для генерации слайдов,
                        подбора контента и создания впечатляющих выступлений за считанные минуты.
                    </p>
                    <ul>
                        <li><span>✓</span> AI-ассистент для генерации идей</li>
                        <li><span>✓</span> Интуитивный drag-and-drop редактор</li>
                        <li><span>✓</span> Экспорт готовых презентаций в PDF</li>
                    </ul>
                </div>

                <div className="login-form-container">
                    <h3>Вход в редактор</h3>
                    <form onSubmit={handleLogin}>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Логин"
                            className="login-input"
                            disabled={loading}
                        />
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Пароль"
                            className="login-input"
                            disabled={loading}
                        />
                        <button type="submit" className="login-button" disabled={loading}>
                            {loading ? 'Вход...' : 'Войти'}
                        </button>
                        {error && <p className="login-error">{error}</p>}
                    </form>
                </div>
            </main>
        </div>
    );
};