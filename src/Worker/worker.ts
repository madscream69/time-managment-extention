/* eslint-disable no-restricted-globals */

const workercode = () => {
    let timerInterval: NodeJS.Timeout;
    // let time = 25 * 60;
    self.onmessage = function ({ data: { turn, time } }) {
        if (turn === 'off' || timerInterval) {
            clearInterval(timerInterval);
            // time = 25 * 60;
        }
        if (turn === 'on') {
            timerInterval = setInterval(() => {
                time -= 1;
                self.postMessage({ time });
            }, 1000);
        }
        if (turn === 'pause') self.postMessage({ time });
    };
};

let code = workercode.toString();
code = code.substring(code.indexOf('{') + 1, code.lastIndexOf('}'));

const blob = new Blob([code], { type: 'application/javascript' });
const worker_script = URL.createObjectURL(blob);

// module.exports = worker_script;
export default worker_script;
