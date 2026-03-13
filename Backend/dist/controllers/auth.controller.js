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
exports.register = exports.login = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma_1 = __importDefault(require("../prisma"));
const jwt_1 = require("../utils/jwt");
const zod_1 = require("zod");
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6),
});
const registerSchema = zod_1.z.object({
    nomeEmpresa: zod_1.z.string().min(3),
    nomeUsuario: zod_1.z.string().min(3),
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6),
});
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = loginSchema.parse(req.body);
        const user = yield prisma_1.default.usuario.findUnique({
            where: { email },
        });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const isValidPassword = yield bcryptjs_1.default.compare(password, user.senha);
        if (!isValidPassword) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const token = (0, jwt_1.generateToken)({
            id: user.id,
            email: user.email,
            role: user.role,
            empresaId: user.empresaId,
        });
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
        const { nomeEmpresa, nomeUsuario, email, password } = registerSchema.parse(req.body);
        const existingUser = yield prisma_1.default.usuario.findUnique({
            where: { email },
        });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
        const result = yield prisma_1.default.$transaction((prisma) => __awaiter(void 0, void 0, void 0, function* () {
            const empresa = yield prisma.empresa.create({
                data: {
                    nome: nomeEmpresa,
                },
            });
            const user = yield prisma.usuario.create({
                data: {
                    nome: nomeUsuario,
                    email,
                    senha: hashedPassword,
                    role: 'ADMIN',
                    empresaId: empresa.id,
                },
            });
            return { empresa, user };
        }));
        const token = (0, jwt_1.generateToken)({
            id: result.user.id,
            email: result.user.email,
            role: result.user.role,
            empresaId: result.user.empresaId,
        });
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
