// src/background/background.ts

// Интерфейс для сообщений
interface TimerMessage {
    action: string;
    duration?: number; // Длительность в минутах
    mode?: 'work' | 'break'; // Режим таймера
    isAutomatic: boolean;
}

// Состояние таймера
interface TimerState {
    endTime: number | null; // Время окончания в миллисекундах
    isActive: boolean; // Активен ли таймер
    mode: 'work' | 'break'; // Текущий режим
    duration: number; // Текущая длительность в минутах
}

const durations = { work: 25, break: 5 }; // Длительности в минутах
const timerState: TimerState = {
    endTime: null,
    isActive: false,
    mode: 'work',
    duration: durations.work,
};
let timerId: number | null = null; // Для хранения ID setTimeout

// Сохраняем состояние в chrome.storage
const saveState = () => {
    chrome.storage.local.set({ timerState });
};

// Запускаем таймер
const startTimer = () => {
    if (timerState.endTime && timerState.isActive) {
        const timeLeft = timerState.endTime - Date.now();
        if (timeLeft > 0) {
            timerId = setTimeout(() => {
                chrome.notifications.create({
                    type: 'basic',
                    iconUrl: '../icon.png',
                    title: 'Таймер завершён!',
                    message: `Ваш ${timerState.mode === 'work' ? 'рабочий' : 'перерыв'} таймер закончился!`,
                });
                timerState.endTime = null;
                timerState.isActive = false;
                // Автоматическое переключение режима, если включено
                chrome.storage.local.get(['isAutomatic'], (result) => {
                    if (result.isAutomatic) {
                        timerState.mode = timerState.mode === 'work' ? 'break' : 'work';
                        timerState.duration = durations[timerState.mode];
                        timerState.endTime = Date.now() + timerState.duration * 60 * 1000;
                        timerState.isActive = true;
                        saveState();
                        startTimer();
                    } else {
                        saveState();
                    }
                });
            }, timeLeft) as never; // Приводим к any для совместимости с TS
        }
    }
};

// Слушаем сообщения от popup
chrome.runtime.onMessage.addListener((message: TimerMessage, _sender, sendResponse) => {
    if (message.action === 'startTimer') {
        timerState.isActive = true;
        timerState.mode = message.mode || 'work';
        timerState.duration = durations[timerState.mode];
        timerState.endTime = Date.now() + timerState.duration * 60 * 1000;
        saveState();
        if (timerId) clearTimeout(timerId);
        startTimer();
        sendResponse({ status: 'Timer started' });
    } else if (message.action === 'pauseTimer') {
        timerState.isActive = false;
        if (timerId) clearTimeout(timerId);
        saveState();
        sendResponse({ status: 'Timer paused' });
    } else if (message.action === 'resetTimer') {
        timerState.isActive = false;
        timerState.endTime = null;
        timerState.duration = durations[timerState.mode];
        if (timerId) clearTimeout(timerId);
        saveState();
        sendResponse({ status: 'Timer reset' });
    } else if (message.action === 'switchMode') {
        timerState.mode = message.mode || 'work';
        timerState.duration = durations[timerState.mode];
        timerState.endTime = null;
        timerState.isActive = false;
        if (timerId) clearTimeout(timerId);
        saveState();
        sendResponse({ status: 'Mode switched' });
    } else if (message.action === 'getTimer') {
        const timeLeft = timerState.endTime && timerState.isActive
            ? Math.max(0, Math.floor((timerState.endTime - Date.now()) / 1000))
            : timerState.duration * 60;
        sendResponse({
            timeLeft,
            isActive: timerState.isActive,
            mode: timerState.mode,
        });
    } else if (message.action === 'setAutomatic') {
        chrome.storage.local.set({ isAutomatic: message.isAutomatic }, () => {
            sendResponse({ status: 'Automatic mode updated' });
        });
    }
    return true; // Для асинхронного ответа
});