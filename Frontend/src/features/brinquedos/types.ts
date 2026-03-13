import { z } from 'zod';

export const brinquedoSchema = z.object({
  id: z.number().optional(),
  nome: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  descricao: z.string().optional(),
  marca: z.string().optional(),
  quantidade_total: z.coerce.number({ required_error: "Quantidade é obrigatória" })
    .int("Quantidade deve ser um número inteiro")
    .min(0, "Quantidade deve ser maior ou igual a 0"),
  valorUnitario: z.coerce.number({ required_error: "Valor unitário é obrigatório" })
    .min(0, "Valor deve ser maior ou igual a 0"),
  necessita_funcionario: z.boolean().default(false),
  ativo: z.boolean().default(true),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export type Brinquedo = z.infer<typeof brinquedoSchema>;
