import { createLogger, format, transports } from 'winston';
const { combine, printf } = format;

export const logger = createLogger({
    level: 'debug',
    format: combine(
        printf(({ level, message }) => JSON.stringify({ severity: level, ...message })),
    ),
    transports: [new transports.Console()],
});
