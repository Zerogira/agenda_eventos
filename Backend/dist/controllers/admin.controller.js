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
exports.getEmpresaDetails = exports.listConvites = exports.createConvite = exports.deleteEmpresa = exports.updateEmpresa = exports.listEmpresas = exports.createEmpresa = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const zod_1 = require("zod");
const audit_service_1 = require("../services/audit.service");
const createEmpresaSchema = zod_1.z.object({
    nome: zod_1.z.string().min(3),
    cnpj: zod_1.z.string().optional(),
});
const updateEmpresaSchema = zod_1.z.object({
    nome: zod_1.z.string().min(3).optional(),
    cnpj: zod_1.z.string().optional(),
    // status: z.enum(['ATIVA', 'INATIVA']).optional() // Assuming status field exists or will be added
});
const createConviteSchema = zod_1.z.object({
    empresaId: zod_1.z.string().uuid(),
    expiresInDays: zod_1.z.number().min(1).default(30),
});
function generateInviteCode(length = 8) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}
const createEmpresa = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { nome, cnpj } = createEmpresaSchema.parse(req.body);
        const result = yield prisma_1.default.$transaction((prisma) => __awaiter(void 0, void 0, void 0, function* () {
            // 1. Create Empresa
            const empresa = yield prisma.empresa.create({
                data: {
                    nome,
                    cnpj,
                },
            });
            // 2. Generate Invite
            const codigo = generateInviteCode();
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 30); // Default 30 days
            // @ts-ignore
            const convite = yield prisma.conviteEmpresa.create({
                data: {
                    codigo,
                    empresaId: empresa.id,
                    expiresAt,
                },
            });
            return { empresa, convite };
        }));
        yield audit_service_1.auditService.log({
            empresaId: result.empresa.id,
            userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id,
            action: 'CREATE',
            resource: 'Empresa',
            resourceId: result.empresa.id,
            details: { nome: result.empresa.nome, cnpj: result.empresa.cnpj },
            ipAddress: req.ip,
            userAgent: req.headers['user-agent']
        });
        res.status(201).json(result);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ message: 'Validation Error', errors: error.errors });
        }
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.createEmpresa = createEmpresa;
const listEmpresas = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const empresas = yield prisma_1.default.empresa.findMany({
            include: {
                _count: {
                    select: { usuarios: true, clientes: true, eventos: true }
                },
                // @ts-ignore
                convites: {
                    where: { usado: false },
                    select: { codigo: true, expiresAt: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(empresas);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.listEmpresas = listEmpresas;
const updateEmpresa = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        const { nome, cnpj } = updateEmpresaSchema.parse(req.body);
        const empresa = yield prisma_1.default.empresa.update({
            where: { id },
            data: { nome, cnpj },
        });
        yield audit_service_1.auditService.log({
            empresaId: empresa.id,
            userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id,
            action: 'UPDATE',
            resource: 'Empresa',
            resourceId: empresa.id,
            details: { changes: req.body },
            ipAddress: req.ip,
            userAgent: req.headers['user-agent']
        });
        res.json(empresa);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ message: 'Validation Error', errors: error.errors });
        }
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.updateEmpresa = updateEmpresa;
const deleteEmpresa = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        const empresa = yield prisma_1.default.empresa.findUnique({ where: { id } });
        if (!empresa)
            return res.status(404).json({ message: 'Empresa not found' });
        yield prisma_1.default.empresa.delete({ where: { id } });
        yield audit_service_1.auditService.log({
            empresaId: id,
            userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id,
            action: 'DELETE',
            resource: 'Empresa',
            resourceId: id,
            details: { nome: empresa.nome },
            ipAddress: req.ip,
            userAgent: req.headers['user-agent']
        });
        res.status(204).send();
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.deleteEmpresa = deleteEmpresa;
const createConvite = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { empresaId, expiresInDays } = createConviteSchema.parse(req.body);
        const empresa = yield prisma_1.default.empresa.findUnique({ where: { id: empresaId } });
        if (!empresa) {
            return res.status(404).json({ message: 'Empresa not found' });
        }
        const codigo = generateInviteCode();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + expiresInDays);
        // @ts-ignore
        const convite = yield prisma_1.default.conviteEmpresa.create({
            data: {
                codigo,
                empresaId,
                expiresAt,
            },
        });
        yield audit_service_1.auditService.log({
            empresaId: empresaId,
            userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id,
            action: 'CREATE_INVITE',
            resource: 'Admin',
            details: { codigo, empresa: empresa.nome },
            ipAddress: req.ip,
            userAgent: req.headers['user-agent']
        });
        res.status(201).json(convite);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ message: 'Validation Error', errors: error.errors });
        }
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.createConvite = createConvite;
const listConvites = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // @ts-ignore
        const convites = yield prisma_1.default.conviteEmpresa.findMany({
            include: {
                empresa: {
                    select: { nome: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(convites);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.listConvites = listConvites;
const getEmpresaDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const empresa = yield prisma_1.default.empresa.findUnique({
            where: { id },
            include: {
                usuarios: true,
                clientes: true,
                funcionarios: true,
                brinquedos: true,
            }
        });
        if (!empresa) {
            return res.status(404).json({ message: 'Empresa not found' });
        }
        res.json(empresa);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.getEmpresaDetails = getEmpresaDetails;
