import {useState, useEffect, useRef} from 'react';
import './Focus.css';
import sound from '../../public/sounds/tictictictic.mp3';

import play from '../assets/play-icon.svg';
import pause from '../assets/pause-icon.svg';
import reset from '../assets/reset-icon.svg';

interface funcProps{
    disableFunc: ()=>void
}

const Focus = ({disableFunc}:funcProps) => {
    const timeoutRef = useRef<null | ReturnType<typeof setTimeout>>(null);
    const durations = { work: 25 * 60, break: 5 * 60 }; // Added: длительности для режимов (в секундах)
    const [mode, setMode] = useState<'work' | 'break'>('work'); // Added: состояние режима
    const [isActive, setIsActive] = useState(false);
    const [isAutoplay, setIsAutoplay] = useState(false);
    const [startTime, setStartTime] = useState(0);
    const [remainingTime, setRemainingTime] = useState(durations[mode]*1000);
    const [endTime, setEndTime] = useState(0);
    const audio = new Audio(sound);
    audio.preload = 'auto';




    const formatTime = (time: number): string => {
        //NEED TO UPGRADE TO MILISECONDS
        const minutes = Math.floor(Math.round(time/1000) / 60);
        const secs = Math.round(time/1000) % 60;
        return `${minutes.toString().padStart(2, '0')}:${secs
            .toString()
            .padStart(2, '0')}`;
    };

    function updateTime(){
        if (isActive){
            timeoutRef.current = setTimeout(() => {
                const newRemainingTime = endTime - Date.now()
                if (newRemainingTime <= 0) {
                    audio.play();
                    pauseTimer();
                    setIsActive(false);
                    if(isAutoplay){
                        switchMode(mode==='work' ? 'break' : "work");
                        startTimer(mode==='work' ? 'break' : "work");
                    }

                }else {
                    setRemainingTime(newRemainingTime);
                    updateTime();
                    console.log(newRemainingTime);
                }
            }, 500);
        }
    }

    useEffect(() => {
        // if (isActive){
        //     timeoutRef.current = setTimeout(() => {
        //         if (remainingTime <= 0) {
        //             audio.play();
        //             pauseTimer();
        //             setIsActive(false);
        //             clearTimeout(timeoutRef.current)
        //             if(isAutoplay){
        //                 switchMode(mode==='work' ? 'break' : "work");
        //                 startTimer();
        //             }
        //
        //         }else {
        //             setRemainingTime(endTime - Date.now());
        //             console.log(remainingTime);
        //         }
        //     }, 1000);
        // }
        updateTime()

        return () => {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        };
    }, [ isActive, endTime]);


    //  NADO FIXING CHANGE TIMER AUTOMATICALLY

    function startTimer(mode?: 'work' | 'break') {
        setIsActive(true);
        const duration = mode ? durations[mode]*1000 : remainingTime;
        setRemainingTime(duration);
        setStartTime(Date.now());
        setEndTime(Date.now()+duration);

    }

    function pauseTimer() {
        // 00:06 -> 00:04 paused -> remainingTime === 00:04;
        // НУЖНО СДЕЛАТЬ ТАК, ЧТОБЫ ПРИ КЛИКЕ НА ПАУЗУ ЗАМОРАЖИВАЛОСЬ ТЕКУЩЕЕ ЗНАЧЕНИЕ ТАЙМЕРА
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
        setIsActive(false);
    }

    function resetTimer(){
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
        setIsActive(false);
        setRemainingTime(durations[mode]*1000);
        setStartTime(0);
        setEndTime(0);
    }

    function switchMode  (newMode: 'work' | 'break')  {
        // resetTimer();
        setMode(newMode);
        setRemainingTime(durations[newMode]*1000);
        // setRemainingTime(newMode === 'work' ? durations.work*1000 : durations.break*1000);
        // setIsAutoplay(false);

        setIsActive(false); // Останавливаем таймер
    };

    return (
        <div className="pomodoro">
            <div className="pomodoro-timer__wrapper">
                <button onClick={disableFunc} className="close-btn">&times;</button>
                <h2 className='pomodoro-timer'>{formatTime(remainingTime)}</h2>
                {/*<div className="mode-controls">*/}
                {/*    <button*/}
                {/*        className={mode === 'work' ? 'active-button' : ''} // Added: подсветка активного режима*/}
                {/*        onClick={() => switchMode('work')}*/}
                {/*    >*/}
                {/*        Work (25 min)*/}
                {/*    </button>*/}
                {/*    <button*/}
                {/*        className={mode === 'break' ? 'active-button' : ''}*/}
                {/*        onClick={() => switchMode('break')}*/}
                {/*    >*/}
                {/*        Break (5 min)*/}
                {/*    </button>*/}
                {/*</div>*/}
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
                            if (isActive) {
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
                            src={isActive ? pause : play}
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
                {/*<div>*/}
                {/*    <input*/}
                {/*        onClick={() => setIsAutomatic(!isAutomatic)}*/}
                {/*        type="checkbox"*/}
                {/*        id="automatic"*/}
                {/*        checked={isAutomatic}*/}
                {/*    />*/}
                {/*    <label htmlFor="automatic">Automatic change timer</label>*/}
                {/*</div>*/}
            </div>

        </div>
    );
};

export default Focus;
