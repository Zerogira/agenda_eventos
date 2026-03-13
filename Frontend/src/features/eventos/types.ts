import { z } from 'zod';
import { Brinquedo } from '../brinquedos/types';
import { Funcionario } from '../funcionarios/types';

export const eventoSchema = z.object({
  id: z.string().optional(),
  titulo: z.string().min(3, "Título deve ter no mínimo 3 caracteres"),
  descricao: z.string().optional(),
  data: z.string().refine((val) => !isNaN(Date.parse(val)), "Data inválida"),
  horaInicio: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Hora inválida"),
  horaFim: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Hora inválida"),
  clienteId: z.coerce.number({ required_error: "Selecione um cliente" }).min(1, "Selecione um cliente"),
  clienteNome: z.string().optional(),
  status: z.enum(['AGENDADO', 'CONCLUIDO', 'CANCELADO']),
  valor: z.coerce.number().min(0, "Valor deve ser maior ou igual a 0"),
  // Endereço
  endereco: z.string().optional(),
  numero: z.string().optional(),
  bairro: z.string().optional(),
  cidade: z.string().optional().default("BOTUCATU"),
  estado: z.string().optional().default("SP"),
  brinquedos: z.array(z.object({
    brinquedoId: z.number(),
    quantidade: z.number().default(1)
  })).optional(),
  funcionarios: z.array(z.number()).optional(),
}).refine((data) => {
  // Converte strings de hora para minutos para comparação
  const [h1, m1] = data.horaInicio.split(':').map(Number);
  const [h2, m2] = data.horaFim.split(':').map(Number);
  const totalMinutes1 = h1 * 60 + m1;
  const totalMinutes2 = h2 * 60 + m2;
  return totalMinutes2 > totalMinutes1;
}, {
  message: "A hora de fim deve ser posterior à hora de início",
  path: ["horaFim"],
});

export type EventoFormData = z.infer<typeof eventoSchema>;

export interface Evento extends Omit<EventoFormData, 'brinquedos' | 'funcionarios'> {
  id: string;
  dataInicio: string; // Backend retorna ISO
  dataFim: string;    // Backend retorna ISO
  endereco?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  brinquedos: Brinquedo[];
  funcionarios: Funcionario[];
  createdAt: string; // ISO
}
