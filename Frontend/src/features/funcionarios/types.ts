import { z } from 'zod';

export const funcionarioSchema = z.object({
  id: z.number().optional(),
  nome: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  cpf: z.string().min(11, "CPF inválido"),
  telefone: z.string().min(10, "Telefone inválido"),
  ativo: z.boolean(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export type Funcionario = z.infer<typeof funcionarioSchema>;
