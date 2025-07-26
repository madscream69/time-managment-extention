// src/workers/timerWorker.ts
let intervalId: number | null = null;
let remainingTime: number = 0;

self.onmessage = (e: MessageEvent) => {
    const { command, time } = e.data;

    if (command === 'start') {
        remainingTime = time;
        if (intervalId) clearInterval(intervalId);
        intervalId = setInterval(() => {
            remainingTime -= 1000;
            if (remainingTime <= 0) {
                (self as any).postMessage({ type: 'finished' });
                clearInterval(intervalId!);
                intervalId = null;
            } else {
                (self as any).postMessage({ type: 'tick', remainingTime });
            }
        }, 1000);
    } else if (command === 'pause') {
        if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
        }
    } else if (command === 'reset') {
        if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
        }
        remainingTime = time;
        (self as any).postMessage({ type: 'tick', remainingTime });
    }
};