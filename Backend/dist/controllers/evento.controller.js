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
exports.deleteEvento = exports.updateStatus = exports.getEvento = exports.createEvento = exports.listEventos = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const zod_1 = require("zod");
const createEventoSchema = zod_1.z.object({
    titulo: zod_1.z.string().min(3),
    descricao: zod_1.z.string().optional(),
    clienteId: zod_1.z.number().int(),
    dataInicio: zod_1.z.string().datetime(),
    dataFim: zod_1.z.string().datetime(),
    brinquedos: zod_1.z.array(zod_1.z.object({
        brinquedoId: zod_1.z.number().int(),
        quantidade: zod_1.z.number().int().min(1),
    })).optional(),
    funcionarios: zod_1.z.array(zod_1.z.number().int()).optional(),
    valorTotal: zod_1.z.number().optional(),
}).refine((data) => new Date(data.dataFim) > new Date(data.dataInicio), {
    message: "Data de fim deve ser maior que data de início",
    path: ["dataFim"],
});
const updateStatusSchema = zod_1.z.object({
    status: zod_1.z.enum(['AGENDADO', 'CONFIRMADO', 'FINALIZADO', 'CANCELADO']),
});
const listEventos = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { start, end } = req.query;
        const empresaId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.empresaId;
        if (!empresaId)
            return res.status(401).json({ message: 'Unauthorized' });
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
            },
        });
        const formattedEventos = eventos.map(evento => ({
            id: evento.id,
            titulo: evento.titulo,
            start: evento.dataInicio,
            end: evento.dataFim,
            status: evento.status,
            cliente: evento.cliente,
            // FullCalendar expects 'title', 'start', 'end'
        }));
        res.json(formattedEventos);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.listEventos = listEventos;
const createEvento = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { titulo, descricao, clienteId, dataInicio, dataFim, brinquedos, funcionarios, valorTotal } = createEventoSchema.parse(req.body);
        const empresaId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.empresaId;
        if (!empresaId)
            return res.status(401).json({ message: 'Unauthorized' });
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
                return res.status(400).json({ message: 'One or more brinquedos not found or do not belong to this company' });
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
                return res.status(400).json({ message: 'One or more funcionarios not found or do not belong to this company' });
            }
        }
        // Check cliente
        const cliente = yield prisma_1.default.cliente.findUnique({
            where: { id: clienteId },
        });
        if (!cliente || cliente.empresaId !== empresaId) {
            return res.status(400).json({ message: 'Cliente not found' });
        }
        const evento = yield prisma_1.default.evento.create({
            data: {
                titulo,
                descricao,
                clienteId,
                empresaId,
                dataInicio: new Date(dataInicio),
                dataFim: new Date(dataFim),
                valorTotal,
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
        res.status(201).json(evento);
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
exports.createEvento = createEvento;
const getEvento = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        const empresaId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.empresaId;
        if (!empresaId)
            return res.status(401).json({ message: 'Unauthorized' });
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
            return res.status(404).json({ message: 'Evento not found' });
        }
        res.json(evento);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.getEvento = getEvento;
const updateStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        const { status } = updateStatusSchema.parse(req.body);
        const empresaId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.empresaId;
        if (!empresaId)
            return res.status(401).json({ message: 'Unauthorized' });
        const evento = yield prisma_1.default.evento.findUnique({
            where: { id },
        });
        if (!evento || evento.empresaId !== empresaId) {
            return res.status(404).json({ message: 'Evento not found' });
        }
        const updatedEvento = yield prisma_1.default.evento.update({
            where: { id },
            data: { status },
        });
        res.json(updatedEvento);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ message: 'Validation error', errors: error.errors });
        }
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.updateStatus = updateStatus;
const deleteEvento = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        const empresaId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.empresaId;
        if (!empresaId)
            return res.status(401).json({ message: 'Unauthorized' });
        const evento = yield prisma_1.default.evento.findUnique({
            where: { id },
        });
        if (!evento || evento.empresaId !== empresaId) {
            return res.status(404).json({ message: 'Evento not found' });
        }
        yield prisma_1.default.evento.delete({
            where: { id },
        });
        res.status(204).send();
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.deleteEvento = deleteEvento;
