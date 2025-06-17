import { useState, useEffect } from 'react';
import worker_script from '../Worker/worker';
import './Focus.css';
import sound from '../assets/sounds/tictictictic.mp3';

import play from '../assets/play-icon.svg';
import pause from '../assets/pause-icon.svg';

const timerWorker = new Worker(worker_script);

interface funcProps{
    disableFunc: ()=>void
}

const Focus = ({disableFunc}:funcProps) => {
    const durations = { work: 25 * 60, break: 5 * 60 }; // Added: длительности для режимов (в секундах)
    const [mode, setMode] = useState<'work' | 'break'>('work'); // Added: состояние режима
    const [isActive, setIsActive] = useState(false);
    const [isAutomatic, setIsAutomatic] = useState(true);
    const [isAutoplay, setIsAutoplay] = useState(false);
    const [webWorkerTime, setWebWorkerTime] = useState(durations.work);
    const audio = new Audio(sound);
    audio.preload = 'auto';
    useEffect(() => {
        if (isActive) {
            timerWorker.onmessage = ({ data: { time } }) => {
                setWebWorkerTime(time);
            };
        }
    }, [isActive]);
    useEffect(() => {
        if (webWorkerTime === 0) {
            audio.play();
            setIsActive(false);
            if (isAutomatic) {
                setMode(mode === 'work' ? 'break' : 'work');
                setWebWorkerTime(
                    mode === 'work' ? durations.break : durations.work
                );
                setIsAutoplay(true);
            }
        }
    }, [webWorkerTime]);
    useEffect(() => {
        if (isAutomatic && webWorkerTime > 0 && !isActive && isAutoplay) {
            startWebWorkerTimer();
            // setIsActive(true);
        }
    }, [mode, webWorkerTime]);
    const startWebWorkerTimer = () => {
        if (webWorkerTime !== 0) {
            timerWorker.postMessage({ turn: 'on', time: webWorkerTime });
        }
        // else if (webWorkerTime <= 0 && isAutomatic) {
        //     setIsActive(true);
        // } else {
        //     setIsActive(false);
        // }
    };
    const pauseWebWorkerTimer = () => {
        timerWorker.postMessage({ turn: 'pause', time: webWorkerTime });
    };
    const resetWebWorkerTimer = () => {
        setIsActive(false);
        timerWorker.postMessage({ turn: 'off', time: durations[mode] });
        setWebWorkerTime(durations[mode]);
        setIsAutoplay(false);
    };

    const formatTime = (time: number): string => {
        const minutes = Math.floor(time / 60);
        const secs = time % 60;
        return `${minutes.toString().padStart(2, '0')}:${secs
            .toString()
            .padStart(2, '0')}`;
    };

    const switchMode = (newMode: 'work' | 'break') => {
        resetWebWorkerTimer();
        setMode(newMode);
        setWebWorkerTime(newMode === 'work' ? durations.work : durations.break);
        setIsAutoplay(false);

        setIsActive(false); // Останавливаем таймер
    };

    return (
        <div className="pomodoro-timer">
            <button onClick={disableFunc} className="close-btn">close</button>
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
                    <img
                        className="icon-btn"
                        src={isActive ? pause : play}
                        alt=""
                    />
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
