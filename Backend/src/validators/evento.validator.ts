import { z } from 'zod';

export const createEventoSchema = z.object({
  titulo: z.string({ required_error: "Título é obrigatório" })
    .min(3, "Título deve ter no mínimo 3 caracteres"),
  descricao: z.string().optional(),
  clienteId: z.number({ required_error: "Cliente é obrigatório" }).int(),
  dataInicio: z.string({ required_error: "Data de início é obrigatória" }).datetime("Data de início inválida"),
  dataFim: z.string({ required_error: "Data de fim é obrigatória" }).datetime("Data de fim inválida"),
  brinquedos: z.array(z.object({
    brinquedoId: z.number().int(),
    quantidade: z.number().int().min(1),
  })).optional(),
  funcionarios: z.array(z.number().int()).optional(),
  valor: z.number().optional(), 
  // Endereço
  endereco: z.string().optional(),
  numero: z.string().optional(),
  bairro: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().optional(),
}).refine((data) => new Date(data.dataFim) > new Date(data.dataInicio), {
  message: "Data de fim deve ser maior que data de início",
  path: ["dataFim"],
});

export const updateEventoSchema = z.object({
  titulo: z.string().min(3).optional(),
  descricao: z.string().optional(),
  clienteId: z.number().int().optional(),
  dataInicio: z.string().datetime().optional(),
  dataFim: z.string().datetime().optional(),
  status: z.enum(['AGENDADO', 'CONFIRMADO', 'FINALIZADO', 'CANCELADO', 'CONCLUIDO']).optional(),
  valor: z.number().optional(),
  brinquedosIds: z.array(z.number().int()).optional(),
  funcionariosIds: z.array(z.number().int()).optional(),
  // Endereço
  endereco: z.string().optional(),
  numero: z.string().optional(),
  bairro: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().optional(),
}).refine((data) => {
  if (data.dataInicio && data.dataFim) {
    return new Date(data.dataFim) > new Date(data.dataInicio);
  }
  return true;
}, {
  message: "Data de fim deve ser maior que data de início",
  path: ["dataFim"],
});

export const updateStatusSchema = z.object({
  status: z.enum(['AGENDADO', 'CONFIRMADO', 'FINALIZADO', 'CANCELADO', 'CONCLUIDO'], { required_error: "Status é obrigatório" }),
});
