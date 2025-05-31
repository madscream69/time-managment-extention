import { useState, useEffect } from 'react';
import worker_script from '../Worker/worker';
import './Focus.css';
import sound from '../assets/sounds/tictictictic.mp3';

const timerWorker = new Worker(worker_script);

const Focus = () => {
    const durations = { work: 25 * 60, break: 5 * 60 }; // Added: длительности для режимов (в секундах)
    const [mode, setMode] = useState<'work' | 'break'>('work'); // Added: состояние режима
    const [isActive, setIsActive] = useState(false);
    const [isAutomatic, setIsAutomatic] = useState(true);

    //NEW with web worker
    const [webWorkerTime, setWebWorkerTime] = useState(durations.work);

    useEffect(() => {
        timerWorker.onmessage = ({ data: { time } }) => {
            setWebWorkerTime(time);
        };
    }, []);
    const startWebWorkerTimer = () => {
        timerWorker.postMessage({ turn: 'on', time: webWorkerTime });
    };
    const pauseWebWorkerTimer = () => {
        timerWorker.postMessage({ turn: 'pause', time: webWorkerTime });
    };
    const resetWebWorkerTimer = () => {
        timerWorker.postMessage({ turn: 'off', time: durations[mode] });

        setWebWorkerTime(durations[mode]);
        setIsActive(false);
    };
    var audio = new Audio(sound);
    audio.preload = 'auto';

    // Обновление таймера
    // useEffect(() => {
    //     let interval: NodeJS.Timeout | null = null;

    //     if (isActive && seconds > 0) {
    //         interval = setInterval(() => {
    //             setSeconds((prev) => prev - 1);
    //         }, 1000);
    //     } else if (seconds === 0) {
    //         audio.play();
    //         setIsActive(false);
    //         if (isAutomatic) {
    //             switchMode(mode === 'work' ? 'break' : 'work');
    //             setIsActive(true);
    //         }
    //     }

    //     return () => {
    //         if (interval) clearInterval(interval);
    //     };
    // }, [isActive, seconds]);

    // Форматирование времени в MM:SS
    const formatTime = (time: number): string => {
        const minutes = Math.floor(time / 60);
        const secs = time % 60;
        return `${minutes.toString().padStart(2, '0')}:${secs
            .toString()
            .padStart(2, '0')}`;
    };

    // Запуск/пауза
    // const toggleTimer = () => {
    //     setIsActive(!isActive);
    // };

    // // Сброс таймера
    // const resetTimer = () => {
    //     setIsActive(false);
    //     setSeconds(durations[mode]); // Added: сбрасываем в зависимости от режима
    // };

    // Переключение режима
    const switchMode = (newMode: 'work' | 'break') => {
        resetWebWorkerTimer();
        setMode(newMode);
        setWebWorkerTime(newMode === 'work' ? durations.work : durations.break);

        setIsActive(false); // Останавливаем таймер
    };

    return (
        <div className="pomodoro-timer">
            <h2>{formatTime(webWorkerTime)}</h2>
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
                <button
                    onClick={() => {
                        if (isActive) {
                            pauseWebWorkerTimer();
                            setIsActive(!isActive);
                        } else {
                            startWebWorkerTimer();
                            setIsActive(!isActive);
                        }
                    }}
                >
                    {isActive ? 'Pause' : 'Start'}
                </button>
                {/* <button onClick={startWebWorkerTimer}>Start</button>
                <button
                    onClick={() => {
                        pauseWebWorkerTimer();
                        setIsActive(!isActive);
                    }}
                >
                    Pause
                </button> */}
                <button onClick={resetWebWorkerTimer}>Reset</button>
            </div>
            <div>
                <input
                    onClick={() => setIsAutomatic(!isAutomatic)}
                    type="checkbox"
                    id="automatic"
                    checked={isAutomatic}
                />
                <label htmlFor="automatic">Automatic change timer</label>
            </div>
        </div>
    );
};

export default Focus;
