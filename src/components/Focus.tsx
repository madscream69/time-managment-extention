import {useState, useEffect, useRef} from 'react';
import './Focus.scss';
import audioSrc from '/sounds/tictictictic.mp3';

import play from '../assets/play-icon.svg';
import pause from '../assets/pause-icon.svg';
import reset from '../assets/reset-icon.svg';

interface funcProps{
    disableFunc: ()=>void
}

const Focus = ({disableFunc}:funcProps) => {
    const durations = { work: 25 * 60*1000, break: 5 * 60*1000 }; // Added: длительности для режимов (в секундах)
    const [mode, setMode] = useState<'work' | 'break' | string>(localStorage.getItem('mode') ? localStorage.getItem('mode') :'work'); // Added: состояние режима
    const [isAutoplay, setIsAutoplay] = useState(true);

    const [finished, setFinished] = useState<boolean>(false);

    //New Timer

    const [time, setTime] = useState(localStorage.getItem('time') ? Number(localStorage.getItem('time')) : durations[mode]);
    const [isRunning, setIsRunning] = useState(false);
    const workerRef = useRef<Worker | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const startTimer = () => {
        if (!isRunning && time > 0) {
            setIsRunning(true);
            workerRef.current?.postMessage({ command: 'start', time });

        }
    };

    const pauseTimer = () => {
        setIsRunning(false);
        workerRef.current?.postMessage({ command: 'pause' });
    };

    const resetTimer = () => {
        setIsRunning(false);
        setTime(durations[mode]);
        workerRef.current?.postMessage({ command: 'reset', time: durations[mode] });
    };

    // Форматирование времени
    const formatTime = (ms: number): string => {
        const seconds = Math.floor((ms / 1000) % 60);
        const minutes = Math.floor((ms / (1000 * 60)) % 60);
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    function switchMode  (newMode: 'work' | 'break')  {
        setMode(newMode);
        setTime(durations[newMode]);
        setFinished(false);
        setIsRunning(false); // Останавливаем таймер
    }

    //New Timer
    // Инициализация Web Worker
    useEffect(() => {
        workerRef.current = new Worker(new URL('../Worker/worker.ts', import.meta.url));
        workerRef.current.onmessage = (e: MessageEvent) => {
            const { type, remainingTime } = e.data;
            if (type === 'tick') {
                setTime(remainingTime);
            } else if (type === 'finished') {
                setIsRunning(false);
                setFinished(true);
                setTime(0);
                if(isAutoplay) {
                    switchMode(mode === 'work'? 'break': 'work');
                    setFinished(true);

                }
                if (audioRef.current) {
                    audioRef.current.play().catch((error) => {
                        console.error('Ошибка воспроизведения звука:', error);
                    });
                }
            }
        };

        return () => {
            workerRef.current?.terminate();
        };
    }, [isAutoplay, mode]);

    // Инициализация аудио
    useEffect(() => {
        audioRef.current = new Audio(audioSrc);
        audioRef.current.preload = 'auto';
    }, []);

    useEffect(() => {
        if (isAutoplay && !isRunning && finished) {
            startTimer();
        }
    }, [mode, finished]);

    useEffect(() => {

        localStorage.setItem('time', JSON.stringify(time));
        localStorage.setItem('mode', mode);

    }, [time]);

    return (
        <div className="pomodoro">
            <div className="pomodoro-timer__wrapper">
                <button onClick={disableFunc} className="close-btn">&times;</button>
                <h2 className='pomodoro-timer'>{formatTime(time)}</h2>
                <div className="switch-box">
                    <span className={`switch-text${mode === 'break' ? ' switch-text--active' : ''}`}>Break</span>
                    <label onChange={() => switchMode(mode === 'break' ? 'work' : 'break')} className="switch-label">
                        <input className="switch-input" type="checkbox" checked={mode === 'work'}/>
                        <span className="switch-slider"></span>
                    </label>
                    <span className={`switch-text${mode === 'work' ? ' switch-text--active' : ''}`}>Work</span>
                </div>
                <div className="controls">
                    <button
                        className="control-btn"
                        onClick={() => {
                            if (isRunning) {
                                pauseTimer();
                                // setIsActive(!isActive);
                            } else {
                                startTimer();
                                // setIsActive(!isActive);
                            }

                        }}
                    >
                        <img
                            className="icon-btn"
                            src={isRunning ? pause : play}
                            alt=""
                        />
                    </button>
                    <button className='reset-btn' onClick={resetTimer}><img className="reset__icon-btn"
                                                                                     src={reset} alt="Reset"/></button>
                </div>
                <div className="automatic-wrapper">
                    <div className="round">
                        <input onClick={() => setIsAutoplay(!isAutoplay)}  type="checkbox" id="automatic" checked={isAutoplay}/>
                        <label htmlFor="automatic"></label>
                    </div>
                    <span className="automatic-wrapper__text"><label htmlFor="automatic">Change timer automatically</label></span>
                </div>
            </div>

        </div>
    );
};

export default Focus;
