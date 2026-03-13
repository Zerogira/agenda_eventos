"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const pino_http_1 = __importDefault(require("pino-http"));
const logger_1 = require("./utils/logger");
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const cliente_routes_1 = __importDefault(require("./routes/cliente.routes"));
const funcionario_routes_1 = __importDefault(require("./routes/funcionario.routes"));
const brinquedo_routes_1 = __importDefault(require("./routes/brinquedo.routes"));
const evento_routes_1 = __importDefault(require("./routes/evento.routes"));
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
const audit_routes_1 = __importDefault(require("./routes/audit.routes"));
const error_middleware_1 = require("./middlewares/error.middleware");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Request logging middleware
app.use((0, pino_http_1.default)({
    logger: logger_1.logger,
    // Define custom serializers if needed, or stick to defaults which are good
    serializers: {
        req: (req) => ({
            method: req.method,
            url: req.url,
            // body: req.raw.body, // Be careful with sensitive data in body
        }),
        res: (res) => ({
            statusCode: res.statusCode,
        }),
    },
    // Quiet logs for health checks or static assets if any
    autoLogging: {
        ignore: (req) => req.url === '/health' || req.url === '/favicon.ico',
    },
}));
app.use('/api/auth', auth_routes_1.default);
app.use('/api/clientes', cliente_routes_1.default);
app.use('/api/funcionarios', funcionario_routes_1.default);
app.use('/api/brinquedos', brinquedo_routes_1.default);
app.use('/api/eventos', evento_routes_1.default);
app.use('/api/admin', admin_routes_1.default);
app.use('/api/system-logs', audit_routes_1.default); // Changed from /audit to avoid AdBlockers
app.use(error_middleware_1.errorHandler);
exports.default = app;
