import { useState, useEffect } from 'react';
import './Focus.css';
const Focus = () => {
    const durations = { work: 25 * 60, break: 5 * 60 }; // Added: длительности для режимов (в секундах)
    const [mode, setMode] = useState<'work' | 'break'>('work'); // Added: состояние режима
    const [seconds, setSeconds] = useState(durations.work); // Инициализация рабочим режимом
    const [isActive, setIsActive] = useState(false);

    // Обновление таймера
    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;

        if (isActive && seconds > 0) {
            interval = setInterval(() => {
                setSeconds((prev) => prev - 1);
            }, 1000);
        } else if (seconds === 0) {
            setIsActive(false);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isActive, seconds]);

    // Форматирование времени в MM:SS
    const formatTime = (time: number): string => {
        const minutes = Math.floor(time / 60);
        const secs = time % 60;
        return `${minutes.toString().padStart(2, '0')}:${secs
            .toString()
            .padStart(2, '0')}`;
    };

    // Запуск/пауза
    const toggleTimer = () => {
        setIsActive(!isActive);
    };

    // Сброс таймера
    const resetTimer = () => {
        setIsActive(false);
        setSeconds(durations[mode]); // Added: сбрасываем в зависимости от режима
    };

    // Переключение режима
    const switchMode = (newMode: 'work' | 'break') => {
        // Added
        setMode(newMode);
        setIsActive(false); // Останавливаем таймер
        setSeconds(durations[newMode]); // Устанавливаем время для нового режима
    };

    return (
        <div className="pomodoro-timer">
            <h2>{formatTime(seconds)}</h2>
            <div className="mode-controls">
                <button
                    className={mode === 'work' ? 'active-button' : ''} // Added: подсветка активного режима
                    onClick={() => switchMode('work')}
                >
                    Work (25 min)
                </button>
                <button
                    className={mode === 'break' ? 'active-button' : ''}
                    onClick={() => switchMode('break')}
                >
                    Break (5 min)
                </button>
            </div>
            <div className="controls">
                <button onClick={toggleTimer}>
                    {isActive ? 'Pause' : 'Start'}
                </button>
                <button onClick={resetTimer}>Reset</button>
            </div>
        </div>
    );
};

export default Focus;
