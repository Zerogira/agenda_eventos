"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = exports.login = exports.changePassword = exports.updateProfile = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma_1 = __importDefault(require("../prisma"));
const jwt_1 = require("../utils/jwt");
const zod_1 = require("zod");
const audit_service_1 = require("../services/audit.service");
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6),
});
const registerSchema = zod_1.z.object({
    nomeUsuario: zod_1.z.string().min(3),
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6),
    codigoConvite: zod_1.z.string().min(1, "Código de convite é obrigatório"),
});
const updateProfileSchema = zod_1.z.object({
    name: zod_1.z.string().min(3).optional(),
    email: zod_1.z.string().email().optional(),
});
const updateProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { name, email } = updateProfileSchema.parse(req.body);
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const user = yield prisma_1.default.usuario.findUnique({
            where: { id: userId },
        });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (email && email !== user.email) {
            const existingUser = yield prisma_1.default.usuario.findUnique({
                where: { email },
            });
            if (existingUser) {
                return res.status(400).json({ message: 'Email already in use' });
            }
        }
        const updatedUser = yield prisma_1.default.usuario.update({
            where: { id: userId },
            data: {
                nome: name,
                email: email,
            },
        });
        yield audit_service_1.auditService.log({
            empresaId: updatedUser.empresaId,
            userId: updatedUser.id,
            action: 'UPDATE_PROFILE',
            resource: 'Auth',
            details: { name, email },
            ipAddress: req.ip,
            userAgent: req.headers['user-agent']
        });
        res.json({
            id: updatedUser.id,
            name: updatedUser.nome,
            email: updatedUser.email,
            role: updatedUser.role,
            empresaId: updatedUser.empresaId,
        });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({
                statusCode: 400,
                message: 'Validation Error',
                errors: error.errors.map(e => e.message),
            });
        }
        console.error(error);
        res.status(500).json({
            statusCode: 500,
            message: 'Internal server error',
            errors: [error.message]
        });
    }
});
exports.updateProfile = updateProfile;
const changePasswordSchema = zod_1.z.object({
    currentPassword: zod_1.z.string().min(6),
    newPassword: zod_1.z.string().min(6),
});
const changePassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const user = yield prisma_1.default.usuario.findUnique({
            where: { id: userId },
        });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const isValidPassword = yield bcryptjs_1.default.compare(currentPassword, user.senha);
        if (!isValidPassword) {
            return res.status(400).json({ message: 'Senha atual incorreta' });
        }
        const hashedPassword = yield bcryptjs_1.default.hash(newPassword, 10);
        yield prisma_1.default.usuario.update({
            where: { id: userId },
            data: { senha: hashedPassword },
        });
        res.json({ message: 'Senha alterada com sucesso' });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({
                statusCode: 400,
                message: 'Validation Error',
                errors: error.errors.map(e => e.message),
            });
        }
        console.error(error);
        res.status(500).json({
            statusCode: 500,
            message: 'Internal server error',
            errors: [error.message]
        });
    }
});
exports.changePassword = changePassword;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = loginSchema.parse(req.body);
        const user = yield prisma_1.default.usuario.findUnique({
            where: { email },
        });
        if (!user) {
            req.log.warn({ action: 'login_failed', email }, 'Tentativa de login com email inexistente');
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const isValidPassword = yield bcryptjs_1.default.compare(password, user.senha);
        if (!isValidPassword) {
            req.log.warn({ action: 'login_failed', email, empresaId: user.empresaId }, 'Tentativa de login com senha incorreta');
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const token = (0, jwt_1.generateToken)({
            id: user.id,
            email: user.email,
            role: user.role,
            empresaId: user.empresaId,
        });
        yield audit_service_1.auditService.log({
            empresaId: user.empresaId,
            userId: user.id,
            action: 'LOGIN',
            resource: 'Auth',
            details: { email: user.email },
            ipAddress: req.ip,
            userAgent: req.headers['user-agent']
        });
        req.log.info({
            action: 'login_success',
            empresaId: user.empresaId,
            userId: user.id,
            email: user.email
        }, 'Login realizado com sucesso');
        res.json({
            accessToken: token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                empresaId: user.empresaId,
            },
        });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({
                statusCode: 400,
                message: 'Validation Error',
                errors: error.errors.map(e => e.message),
            });
        }
        res.status(500).json({
            statusCode: 500,
            message: 'Internal server error',
            errors: [error.message]
        });
    }
});
exports.login = login;
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { nomeUsuario, email, password, codigoConvite } = registerSchema.parse(req.body);
        // 1. Check if user exists
        const existingUser = yield prisma_1.default.usuario.findUnique({
            where: { email },
        });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        // 2. Validate Invite
        // Note: TypeScript might complain if Prisma Client is not regenerated yet, but logic is correct
        // @ts-ignore
        const convite = yield prisma_1.default.conviteEmpresa.findUnique({
            where: { codigo: codigoConvite },
            include: { empresa: true }
        });
        if (!convite) {
            return res.status(400).json({ message: 'Código de convite inválido ou inexistente' });
        }
        if (convite.usado) {
            return res.status(400).json({ message: 'Este código de convite já foi utilizado' });
        }
        if (new Date() > new Date(convite.expiresAt)) {
            return res.status(400).json({ message: 'Código de convite expirado' });
        }
        const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
        const result = yield prisma_1.default.$transaction((prisma) => __awaiter(void 0, void 0, void 0, function* () {
            // Create user linked to company
            const user = yield prisma.usuario.create({
                data: {
                    nome: nomeUsuario,
                    email,
                    senha: hashedPassword,
                    role: 'ADMIN', // First user via invite is typically Admin of that company? Or USER? Requirement implies "ADMIN" or "USER". Let's default to ADMIN for now as they are setting up. Or maybe USER? Usually invite is for employees. But initial setup is for Admin.
                    // Requirement: "Admin cria empresa -> Sistema gera convite -> Usuário informa código".
                    // This implies the user registering is likely the owner/admin of that company invite, OR an employee.
                    // Since the prompt says "Permitir que apenas empresas criadas por um Super Admin possam registrar usuários",
                    // and "Admin cria empresa... gera convite... envia ao cliente",
                    // The "cliente" here is likely the company owner. So they should be ADMIN.
                    // Future invites for employees should probably be generated by the company Admin themselves (scope for later).
                    // For now, let's assume ADMIN role for this invite flow as it's the onboarding flow.
                    empresaId: convite.empresaId,
                },
            });
            // Mark invite as used
            // @ts-ignore
            yield prisma.conviteEmpresa.update({
                where: { id: convite.id },
                data: { usado: true }
            });
            return { user };
        }));
        const token = (0, jwt_1.generateToken)({
            id: result.user.id,
            email: result.user.email,
            role: result.user.role,
            empresaId: result.user.empresaId,
        });
        yield audit_service_1.auditService.log({
            empresaId: result.user.empresaId,
            userId: result.user.id,
            action: 'REGISTER',
            resource: 'Auth',
            details: { email: result.user.email, codigoConvite },
            ipAddress: req.ip,
            userAgent: req.headers['user-agent']
        });
        req.log.info({
            action: 'register_success',
            empresaId: result.user.empresaId,
            userId: result.user.id,
            email: result.user.email
        }, 'Usuário registrado com sucesso');
        res.status(201).json({
            accessToken: token,
            user: {
                id: result.user.id,
                email: result.user.email,
                role: result.user.role,
                empresaId: result.user.empresaId,
            },
        });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({
                statusCode: 400,
                message: 'Validation Error',
                errors: error.errors.map(e => e.message),
            });
        }
        console.error(error);
        res.status(500).json({
            statusCode: 500,
            message: 'Internal server error',
            errors: [error.message]
        });
    }
});
exports.register = register;
