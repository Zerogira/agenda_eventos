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
exports.deleteCliente = exports.updateCliente = exports.getCliente = exports.createCliente = exports.listClientes = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const zod_1 = require("zod");
const audit_service_1 = require("../services/audit.service");
const createClienteSchema = zod_1.z.object({
    nome: zod_1.z.string().min(3),
    telefone: zod_1.z.string().min(8),
    cidade: zod_1.z.string().min(3),
});
const listClientes = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { page = 1, limit = 10, search } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const take = Number(limit);
        const empresaId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.empresaId;
        if (!empresaId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const where = {
            empresaId,
        };
        if (search) {
            where.OR = [
                { nome: { contains: String(search), mode: 'insensitive' } },
                { cidade: { contains: String(search), mode: 'insensitive' } },
            ];
        }
        const [clientes, total] = yield prisma_1.default.$transaction([
            prisma_1.default.cliente.findMany({
                where,
                skip,
                take,
                orderBy: { nome: 'asc' },
            }),
            prisma_1.default.cliente.count({ where }),
        ]);
        res.json({
            data: clientes,
            meta: {
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / Number(limit)),
            },
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.listClientes = listClientes;
const createCliente = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const { nome, telefone, cidade } = createClienteSchema.parse(req.body);
        const empresaId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.empresaId;
        if (!empresaId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const cliente = yield prisma_1.default.cliente.create({
            data: {
                nome,
                telefone,
                cidade,
                empresaId,
            },
        });
        yield audit_service_1.auditService.log({
            empresaId,
            userId: (_b = req.user) === null || _b === void 0 ? void 0 : _b.id,
            action: 'CREATE',
            resource: 'Cliente',
            resourceId: cliente.id.toString(),
            details: { nome, cidade },
            ipAddress: req.ip,
            userAgent: req.headers['user-agent']
        });
        req.log.info({
            action: 'create_cliente',
            empresaId,
            usuarioId: (_c = req.user) === null || _c === void 0 ? void 0 : _c.id,
            clienteId: cliente.id,
            nome: cliente.nome
        }, 'Cliente criado com sucesso');
        res.status(201).json(cliente);
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
exports.createCliente = createCliente;
const getCliente = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        const empresaId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.empresaId;
        if (!empresaId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const cliente = yield prisma_1.default.cliente.findUnique({
            where: { id: Number(id) },
        });
        if (!cliente || cliente.empresaId !== empresaId) {
            return res.status(404).json({ message: 'Cliente not found' });
        }
        res.json(cliente);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            statusCode: 500,
            message: 'Internal server error',
            errors: [error.message]
        });
    }
});
exports.getCliente = getCliente;
const updateCliente = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const { id } = req.params;
        const { nome, telefone, cidade } = createClienteSchema.parse(req.body);
        const empresaId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.empresaId;
        if (!empresaId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const cliente = yield prisma_1.default.cliente.findUnique({
            where: { id: Number(id) },
        });
        if (!cliente || cliente.empresaId !== empresaId) {
            return res.status(404).json({ message: 'Cliente not found' });
        }
        const updatedCliente = yield prisma_1.default.cliente.update({
            where: { id: Number(id) },
            data: {
                nome,
                telefone,
                cidade,
            },
        });
        yield audit_service_1.auditService.log({
            empresaId,
            userId: (_b = req.user) === null || _b === void 0 ? void 0 : _b.id,
            action: 'UPDATE',
            resource: 'Cliente',
            resourceId: updatedCliente.id.toString(),
            details: {
                changes: req.body
            },
            ipAddress: req.ip,
            userAgent: req.headers['user-agent']
        });
        req.log.info({
            action: 'update_cliente',
            empresaId,
            usuarioId: (_c = req.user) === null || _c === void 0 ? void 0 : _c.id,
            clienteId: updatedCliente.id,
            nome: updatedCliente.nome
        }, 'Cliente atualizado com sucesso');
        res.json(updatedCliente);
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
exports.updateCliente = updateCliente;
const deleteCliente = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const { id } = req.params;
        const empresaId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.empresaId;
        if (!empresaId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const cliente = yield prisma_1.default.cliente.findUnique({
            where: { id: Number(id) },
        });
        if (!cliente || cliente.empresaId !== empresaId) {
            return res.status(404).json({ message: 'Cliente not found' });
        }
        yield prisma_1.default.cliente.delete({
            where: { id: Number(id) },
        });
        yield audit_service_1.auditService.log({
            empresaId,
            userId: (_b = req.user) === null || _b === void 0 ? void 0 : _b.id,
            action: 'DELETE',
            resource: 'Cliente',
            resourceId: id,
            details: { nome: cliente.nome },
            ipAddress: req.ip,
            userAgent: req.headers['user-agent']
        });
        req.log.info({
            action: 'delete_cliente',
            empresaId,
            usuarioId: (_c = req.user) === null || _c === void 0 ? void 0 : _c.id,
            clienteId: Number(id),
            nome: cliente.nome
        }, 'Cliente excluído com sucesso');
        res.status(200).json({ message: 'Cliente excluído com sucesso' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            statusCode: 500,
            message: 'Internal server error',
            errors: [error.message]
        });
    }
});
exports.deleteCliente = deleteCliente;
