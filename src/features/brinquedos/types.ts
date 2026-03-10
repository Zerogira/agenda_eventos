import { z } from 'zod';

export const brinquedoSchema = z.object({
  id: z.number().optional(),
  nome: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  descricao: z.string().optional(),
  marca: z.string().optional(),
  quantidade_total: z.coerce.number().min(0, "Quantidade deve ser maior ou igual a 0"),
  necessita_funcionario: z.boolean(),
  ativo: z.boolean(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export type Brinquedo = z.infer<typeof brinquedoSchema>;
