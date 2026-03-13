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
exports.deleteEvento = exports.concluirEvento = exports.updateStatus = exports.getEvento = exports.createEvento = exports.listEventos = exports.updateEvento = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const audit_service_1 = require("../services/audit.service");
const evento_validator_1 = require("../validators/evento.validator");
const AppError_1 = require("../utils/AppError");
const updateEvento = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const { id } = req.params;
        const { titulo, descricao, clienteId, dataInicio, dataFim, status, valor, brinquedosIds, funcionariosIds, endereco, numero, bairro, cidade, estado } = evento_validator_1.updateEventoSchema.parse(req.body);
        const empresaId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.empresaId;
        if (!empresaId)
            throw new AppError_1.AppError('Unauthorized', 401);
        const evento = yield prisma_1.default.evento.findUnique({
            where: { id },
            include: {
                brinquedos: true,
                funcionarios: true,
            },
        });
        if (!evento || evento.empresaId !== empresaId) {
            throw new AppError_1.AppError('Evento não encontrado', 404);
        }
        // Validate brinquedosIds if provided
        if (brinquedosIds && brinquedosIds.length > 0) {
            const existingBrinquedos = yield prisma_1.default.brinquedo.findMany({
                where: {
                    id: { in: brinquedosIds },
                    empresaId,
                },
            });
            if (existingBrinquedos.length !== brinquedosIds.length) {
                throw new AppError_1.AppError('Um ou mais brinquedos não encontrados ou não pertencem a esta empresa');
            }
        }
        // Validate funcionariosIds if provided
        if (funcionariosIds && funcionariosIds.length > 0) {
            const existingFuncionarios = yield prisma_1.default.funcionario.findMany({
                where: {
                    id: { in: funcionariosIds },
                    empresaId,
                },
            });
            if (existingFuncionarios.length !== funcionariosIds.length) {
                throw new AppError_1.AppError('Um ou mais funcionários não encontrados ou não pertencem a esta empresa');
            }
        }
        // Check cliente if provided
        if (clienteId) {
            const cliente = yield prisma_1.default.cliente.findUnique({
                where: { id: clienteId },
            });
            if (!cliente || cliente.empresaId !== empresaId) {
                throw new AppError_1.AppError('Cliente não encontrado');
            }
        }
        const updatedEvento = yield prisma_1.default.evento.update({
            where: { id },
            data: {
                titulo,
                descricao,
                clienteId,
                dataInicio: dataInicio ? new Date(dataInicio) : undefined,
                dataFim: dataFim ? new Date(dataFim) : undefined,
                status,
                valorTotal: valor,
                // Endereço
                endereco,
                numero,
                bairro,
                cidade,
                estado,
                brinquedos: brinquedosIds ? {
                    deleteMany: {},
                    create: brinquedosIds.map(id => ({
                        brinquedoId: id,
                        quantidade: 1, // Default quantity 1 as per simple list
                    })),
                } : undefined,
                funcionarios: funcionariosIds ? {
                    deleteMany: {},
                    create: funcionariosIds.map(id => ({
                        funcionarioId: id,
                    })),
                } : undefined,
            },
            include: {
                brinquedos: {
                    include: { brinquedo: true }
                },
                funcionarios: {
                    include: { funcionario: true }
                },
            },
        });
        req.log.info({
            action: 'update_event',
            empresaId,
            usuarioId: (_b = req.user) === null || _b === void 0 ? void 0 : _b.id,
            eventoId: updatedEvento.id,
            titulo: updatedEvento.titulo
        }, 'Evento atualizado com sucesso');
        yield audit_service_1.auditService.log({
            empresaId,
            userId: (_c = req.user) === null || _c === void 0 ? void 0 : _c.id,
            action: 'UPDATE',
            resource: 'Evento',
            resourceId: updatedEvento.id,
            details: {
                changes: req.body
            },
            ipAddress: req.ip,
            userAgent: req.headers['user-agent']
        });
        res.json({ success: true, data: updatedEvento });
    }
    catch (error) {
        next(error);
    }
});
exports.updateEvento = updateEvento;
const listEventos = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { start, end } = req.query;
        const empresaId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.empresaId;
        if (!empresaId)
            throw new AppError_1.AppError('Unauthorized', 401);
        const where = { empresaId };
        if (start && end) {
            where.dataInicio = {
                gte: new Date(String(start)),
            };
            where.dataFim = {
                lte: new Date(String(end)),
            };
        }
        const eventos = yield prisma_1.default.evento.findMany({
            where,
            include: {
                cliente: {
                    select: { nome: true },
                },
                brinquedos: {
                    include: {
                        brinquedo: true
                    }
                },
                funcionarios: {
                    include: {
                        funcionario: true
                    }
                }
            },
        });
        const formattedEventos = eventos.map(evento => ({
            id: evento.id,
            titulo: evento.titulo,
            start: evento.dataInicio,
            end: evento.dataFim,
            status: evento.status,
            createdAt: evento.createdAt,
            cliente: evento.cliente,
            valor: evento.valorTotal ? Number(evento.valorTotal) : 0,
            brinquedos: evento.brinquedos.map(eb => (Object.assign(Object.assign({}, eb.brinquedo), { quantidade: eb.quantidade }))),
            funcionarios: evento.funcionarios.map(ef => (Object.assign({}, ef.funcionario)))
            // FullCalendar expects 'title', 'start', 'end'
        }));
        res.json({ success: true, data: formattedEventos });
    }
    catch (error) {
        next(error);
    }
});
exports.listEventos = listEventos;
const createEvento = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { titulo, descricao, clienteId, dataInicio, dataFim, brinquedos, funcionarios, valor, endereco, numero, bairro, cidade, estado } = evento_validator_1.createEventoSchema.parse(req.body);
        const empresaId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.empresaId;
        if (!empresaId)
            throw new AppError_1.AppError('Unauthorized', 401);
        // Validate if brinquedos exist and belong to the company
        if (brinquedos && brinquedos.length > 0) {
            const brinquedoIds = brinquedos.map(b => b.brinquedoId);
            const existingBrinquedos = yield prisma_1.default.brinquedo.findMany({
                where: {
                    id: { in: brinquedoIds },
                    empresaId,
                },
            });
            if (existingBrinquedos.length !== brinquedoIds.length) {
                throw new AppError_1.AppError('Um ou mais brinquedos não encontrados ou não pertencem a esta empresa');
            }
        }
        // Validate if funcionarios exist and belong to the company
        if (funcionarios && funcionarios.length > 0) {
            const existingFuncionarios = yield prisma_1.default.funcionario.findMany({
                where: {
                    id: { in: funcionarios },
                    empresaId,
                },
            });
            if (existingFuncionarios.length !== funcionarios.length) {
                throw new AppError_1.AppError('Um ou mais funcionários não encontrados ou não pertencem a esta empresa');
            }
        }
        // Check cliente
        const cliente = yield prisma_1.default.cliente.findUnique({
            where: { id: clienteId },
        });
        if (!cliente || cliente.empresaId !== empresaId) {
            throw new AppError_1.AppError('Cliente não encontrado');
        }
        const evento = yield prisma_1.default.evento.create({
            data: {
                titulo,
                descricao,
                clienteId,
                empresaId,
                dataInicio: new Date(dataInicio),
                dataFim: new Date(dataFim),
                valorTotal: valor, // Mapeando 'valor' (input) para 'valorTotal' (banco)
                // Endereço
                endereco,
                numero,
                bairro,
                cidade,
                estado,
                brinquedos: {
                    create: brinquedos === null || brinquedos === void 0 ? void 0 : brinquedos.map(b => ({
                        brinquedoId: b.brinquedoId,
                        quantidade: b.quantidade,
                    })),
                },
                funcionarios: {
                    create: funcionarios === null || funcionarios === void 0 ? void 0 : funcionarios.map(id => ({
                        funcionarioId: id,
                    })),
                },
            },
            include: {
                brinquedos: true,
                funcionarios: true,
            },
        });
        req.log.info({
            action: 'create_event',
            empresaId,
            usuarioId: (_b = req.user) === null || _b === void 0 ? void 0 : _b.id,
            eventoId: evento.id,
            titulo: evento.titulo
        }, 'Evento criado com sucesso');
        res.status(201).json({ success: true, data: evento });
    }
    catch (error) {
        next(error);
    }
});
exports.createEvento = createEvento;
const getEvento = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        const empresaId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.empresaId;
        if (!empresaId)
            throw new AppError_1.AppError('Unauthorized', 401);
        const evento = yield prisma_1.default.evento.findUnique({
            where: { id },
            include: {
                cliente: true,
                brinquedos: {
                    include: {
                        brinquedo: true,
                    },
                },
                funcionarios: {
                    include: {
                        funcionario: true,
                    },
                },
            },
        });
        if (!evento || evento.empresaId !== empresaId) {
            throw new AppError_1.AppError('Evento não encontrado', 404);
        }
        res.json({ success: true, data: evento });
    }
    catch (error) {
        next(error);
    }
});
exports.getEvento = getEvento;
const updateStatus = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { id } = req.params;
        const { status } = evento_validator_1.updateStatusSchema.parse(req.body);
        const empresaId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.empresaId;
        if (!empresaId)
            throw new AppError_1.AppError('Unauthorized', 401);
        const evento = yield prisma_1.default.evento.findUnique({
            where: { id },
        });
        if (!evento || evento.empresaId !== empresaId) {
            throw new AppError_1.AppError('Evento não encontrado', 404);
        }
        const updatedEvento = yield prisma_1.default.evento.update({
            where: { id },
            data: { status },
        });
        yield audit_service_1.auditService.log({
            empresaId,
            userId: (_b = req.user) === null || _b === void 0 ? void 0 : _b.id,
            action: 'UPDATE_STATUS',
            resource: 'Evento',
            resourceId: updatedEvento.id,
            details: { status },
            ipAddress: req.ip,
            userAgent: req.headers['user-agent']
        });
        res.json({ success: true, data: updatedEvento });
    }
    catch (error) {
        next(error);
    }
});
exports.updateStatus = updateStatus;
const concluirEvento = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { id } = req.params;
        const empresaId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.empresaId;
        if (!empresaId)
            throw new AppError_1.AppError('Unauthorized', 401);
        const evento = yield prisma_1.default.evento.findUnique({
            where: { id },
        });
        if (!evento || evento.empresaId !== empresaId) {
            throw new AppError_1.AppError('Evento não encontrado', 404);
        }
        const updatedEvento = yield prisma_1.default.evento.update({
            where: { id },
            data: { status: 'CONCLUIDO' },
        });
        yield audit_service_1.auditService.log({
            empresaId,
            userId: (_b = req.user) === null || _b === void 0 ? void 0 : _b.id,
            action: 'CONCLUDE',
            resource: 'Evento',
            resourceId: updatedEvento.id,
            details: { status: 'CONCLUIDO' },
            ipAddress: req.ip,
            userAgent: req.headers['user-agent']
        });
        res.json({ success: true, data: updatedEvento });
    }
    catch (error) {
        next(error);
    }
});
exports.concluirEvento = concluirEvento;
const deleteEvento = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { id } = req.params;
        const empresaId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.empresaId;
        if (!empresaId)
            throw new AppError_1.AppError('Unauthorized', 401);
        const evento = yield prisma_1.default.evento.findUnique({
            where: { id },
        });
        if (!evento || evento.empresaId !== empresaId) {
            throw new AppError_1.AppError('Evento não encontrado', 404);
        }
        yield prisma_1.default.evento.delete({
            where: { id },
        });
        yield audit_service_1.auditService.log({
            empresaId,
            userId: (_b = req.user) === null || _b === void 0 ? void 0 : _b.id,
            action: 'DELETE',
            resource: 'Evento',
            resourceId: id,
            details: { titulo: evento.titulo },
            ipAddress: req.ip,
            userAgent: req.headers['user-agent']
        });
        res.status(200).json({ success: true, message: 'Evento excluído com sucesso' });
    }
    catch (error) {
        next(error);
    }
});
exports.deleteEvento = deleteEvento;
