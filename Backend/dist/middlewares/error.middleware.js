"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const zod_1 = require("zod");
const AppError_1 = require("../utils/AppError");
const client_1 = require("@prisma/client");
const errorHandler = (err, req, res, next) => {
    var _a;
    // Use logger from request if available (injected by pino-http), otherwise fallback or import global logger
    const log = req.log || console;
    // Log only unexpected errors or critical ones with full stack
    // Operational errors (AppError, Zod) might just need info or warn level if not 500
    if (err instanceof AppError_1.AppError && err.statusCode < 500) {
        log.warn({ err }, `Operational Error: ${err.message}`);
    }
    else if (err instanceof zod_1.ZodError) {
        log.warn({ err }, 'Validation Error');
    }
    else {
        log.error({ err }, 'Unexpected Error');
    }
    // Zod Validation Errors
    if (err instanceof zod_1.ZodError) {
        return res.status(400).json({
            success: false,
            message: 'Erro de validação nos dados enviados.',
            errors: err.errors.map(e => e.message),
        });
    }
    // AppError (Operational Errors)
    if (err instanceof AppError_1.AppError) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
        });
    }
    // Prisma Errors
    if (err instanceof client_1.Prisma.PrismaClientKnownRequestError) {
        // P2002: Unique constraint failed
        if (err.code === 'P2002') {
            const target = ((_a = err.meta) === null || _a === void 0 ? void 0 : _a.target) || [];
            return res.status(400).json({
                success: false,
                message: `Já existe um registro com este(a) ${target.join(', ')}.`,
            });
        }
        // P2025: Record to update not found
        if (err.code === 'P2025') {
            return res.status(404).json({
                success: false,
                message: 'Registro não encontrado para atualização/exclusão.',
            });
        }
    }
    // Fallback for unexpected errors
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Erro interno do servidor.';
    res.status(statusCode).json({
        success: false,
        message,
        // Em produção, não envie stack trace
        // stack: process.env.NODE_ENV === 'development' ? err.stack : undefined, 
    });
};
exports.errorHandler = errorHandler;
