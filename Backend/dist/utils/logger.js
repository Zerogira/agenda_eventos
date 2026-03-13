"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const pino_1 = __importDefault(require("pino"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Ensure logs directory exists
const logDir = path_1.default.join(__dirname, '../../logs');
if (!fs_1.default.existsSync(logDir)) {
    fs_1.default.mkdirSync(logDir, { recursive: true });
}
const transport = pino_1.default.transport({
    targets: [
        {
            target: 'pino/file',
            options: { destination: path_1.default.join(logDir, 'api.log'), mkdir: true },
            level: 'info',
        },
        {
            target: 'pino/file',
            options: { destination: path_1.default.join(logDir, 'error.log'), mkdir: true },
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
exports.logger = (0, pino_1.default)({
    level: process.env.LOG_LEVEL || 'info',
    timestamp: pino_1.default.stdTimeFunctions.isoTime,
    base: undefined, // Remove pid and hostname from logs
}, transport);
