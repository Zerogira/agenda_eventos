import { z } from 'zod';

export const clienteSchema = z.object({
  id: z.number().optional(),
  nome: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  telefone: z.string().min(10, "Telefone inválido"),
  cidade: z.string().min(3, "Cidade deve ter no mínimo 3 caracteres"),
  empresaId: z.string().optional(),
});

export type Cliente = z.infer<typeof clienteSchema>;
