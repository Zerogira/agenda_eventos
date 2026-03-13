import { z } from 'zod';

export const createBrinquedoSchema = z.object({
  nome: z.string({ required_error: "Nome é obrigatório" })
    .min(3, "Nome deve ter no mínimo 3 caracteres"),
  descricao: z.string().optional(),
  marca: z.string().optional(),
  quantidade_total: z.number({ required_error: "Quantidade total é obrigatória" })
    .int("Quantidade deve ser um número inteiro")
    .min(0, "Quantidade não pode ser negativa"),
  valorUnitario: z.number({ required_error: "Valor unitário é obrigatório" })
    .min(0, "Valor unitário não pode ser negativo"),
  necessita_funcionario: z.boolean().optional().default(false),
  ativo: z.boolean().optional().default(true),
});

export const updateBrinquedoSchema = createBrinquedoSchema.partial();
