"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateStatusSchema = exports.updateEventoSchema = exports.createEventoSchema = void 0;
const zod_1 = require("zod");
exports.createEventoSchema = zod_1.z.object({
    titulo: zod_1.z.string({ required_error: "Título é obrigatório" })
        .min(3, "Título deve ter no mínimo 3 caracteres"),
    descricao: zod_1.z.string().optional(),
    clienteId: zod_1.z.number({ required_error: "Cliente é obrigatório" }).int(),
    dataInicio: zod_1.z.string({ required_error: "Data de início é obrigatória" }).datetime("Data de início inválida"),
    dataFim: zod_1.z.string({ required_error: "Data de fim é obrigatória" }).datetime("Data de fim inválida"),
    brinquedos: zod_1.z.array(zod_1.z.object({
        brinquedoId: zod_1.z.number().int(),
        quantidade: zod_1.z.number().int().min(1),
    })).optional(),
    funcionarios: zod_1.z.array(zod_1.z.number().int()).optional(),
    valor: zod_1.z.number().optional(),
    // Endereço
    endereco: zod_1.z.string().optional(),
    numero: zod_1.z.string().optional(),
    bairro: zod_1.z.string().optional(),
    cidade: zod_1.z.string().optional(),
    estado: zod_1.z.string().optional(),
}).refine((data) => new Date(data.dataFim) > new Date(data.dataInicio), {
    message: "Data de fim deve ser maior que data de início",
    path: ["dataFim"],
});
exports.updateEventoSchema = zod_1.z.object({
    titulo: zod_1.z.string().min(3).optional(),
    descricao: zod_1.z.string().optional(),
    clienteId: zod_1.z.number().int().optional(),
    dataInicio: zod_1.z.string().datetime().optional(),
    dataFim: zod_1.z.string().datetime().optional(),
    status: zod_1.z.enum(['AGENDADO', 'CONFIRMADO', 'FINALIZADO', 'CANCELADO', 'CONCLUIDO']).optional(),
    valor: zod_1.z.number().optional(),
    brinquedosIds: zod_1.z.array(zod_1.z.number().int()).optional(),
    funcionariosIds: zod_1.z.array(zod_1.z.number().int()).optional(),
    // Endereço
    endereco: zod_1.z.string().optional(),
    numero: zod_1.z.string().optional(),
    bairro: zod_1.z.string().optional(),
    cidade: zod_1.z.string().optional(),
    estado: zod_1.z.string().optional(),
}).refine((data) => {
    if (data.dataInicio && data.dataFim) {
        return new Date(data.dataFim) > new Date(data.dataInicio);
    }
    return true;
}, {
    message: "Data de fim deve ser maior que data de início",
    path: ["dataFim"],
});
exports.updateStatusSchema = zod_1.z.object({
    status: zod_1.z.enum(['AGENDADO', 'CONFIRMADO', 'FINALIZADO', 'CANCELADO', 'CONCLUIDO'], { required_error: "Status é obrigatório" }),
});
