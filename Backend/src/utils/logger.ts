import pino from 'pino';
import path from 'path';
import fs from 'fs';

// Ensure logs directory exists
const logDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const transport = pino.transport({
  targets: [
    {
      target: 'pino/file',
      options: { destination: path.join(logDir, 'api.log'), mkdir: true },
      level: 'info',
    },
    {
      target: 'pino/file',
      options: { destination: path.join(logDir, 'error.log'), mkdir: true },
      level: 'error',
    },
    {
      target: 'pino-pretty', // Also log to console in dev
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname',
      },
      level: 'info',
    },
  ],
});

export const logger = pino(
  {
    level: process.env.LOG_LEVEL || 'info',
    timestamp: pino.stdTimeFunctions.isoTime,
    base: undefined, // Remove pid and hostname from logs
  },
  transport
);
