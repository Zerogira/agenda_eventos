"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateBrinquedoSchema = exports.createBrinquedoSchema = void 0;
const zod_1 = require("zod");
exports.createBrinquedoSchema = zod_1.z.object({
    nome: zod_1.z.string({ required_error: "Nome é obrigatório" })
        .min(3, "Nome deve ter no mínimo 3 caracteres"),
    descricao: zod_1.z.string().optional(),
    marca: zod_1.z.string().optional(),
    quantidade_total: zod_1.z.number({ required_error: "Quantidade total é obrigatória" })
        .int("Quantidade deve ser um número inteiro")
        .min(0, "Quantidade não pode ser negativa"),
    valorUnitario: zod_1.z.number({ required_error: "Valor unitário é obrigatório" })
        .min(0, "Valor unitário não pode ser negativo"),
    necessita_funcionario: zod_1.z.boolean().optional().default(false),
    ativo: zod_1.z.boolean().optional().default(true),
});
exports.updateBrinquedoSchema = exports.createBrinquedoSchema.partial();
