import { bgBlue, black, green } from "chalk";

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function dateTimePad(value: string | number, digits: number) {
    let number = value;
    while (number.toString().length < digits) {
        number = "0" + number;
    }
    return number;
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function format(tDate: Date) {
    return (
        tDate.getFullYear() +
        "-" +
        dateTimePad(tDate.getMonth() + 1, 2) +
        "-" +
        dateTimePad(tDate.getDate(), 2) +
        " " +
        dateTimePad(tDate.getHours(), 2) +
        ":" +
        dateTimePad(tDate.getMinutes(), 2) +
        ":" +
        dateTimePad(tDate.getSeconds(), 2) +
        "." +
        dateTimePad(tDate.getMilliseconds(), 3)
    );
}

export default class Logger {
    public log(content: string, type = "log") {
        const date = `[${format(new Date(Date.now()))}]:`;
        switch (type) {
            // Check the message type and then print him in the console
            case "log": {
                return console.log(`${date} ${bgBlue(type.toUpperCase())} ${content} `);
            }
            case "warn": {
                return console.log(`${date} ${black.bgYellow(type.toUpperCase())} ${content} `);
            }
            case "error": {
                return console.log(`${date} ${black.bgRed(type.toUpperCase())} ${content} `);
            }
            case "debug": {
                return console.log(`${date} ${green(type.toUpperCase())} ${content} `);
            }
            case "cmd": {
                return console.log(`${date} ${black.bgWhite(type.toUpperCase())} ${content}`);
            }
            case "ready": {
                return console.log(`${date} ${black.bgGreen(type.toUpperCase())} ${content}`);
            }
            case "rest": {
                return console.log(`${date} ${black.bgMagenta(type.toUpperCase())} ${content}`);
            }
            default:
                throw new TypeError(
                    "Logger type must be either warn, debug, log, ready, cmd, rest, or error."
                );
        }
    }
}
