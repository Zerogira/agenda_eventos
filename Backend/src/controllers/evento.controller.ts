import { Request, Response, NextFunction } from 'express';
import prisma from '../prisma';
import { z } from 'zod';
import { auditService } from '../services/audit.service';
import { createEventoSchema, updateEventoSchema, updateStatusSchema } from '../validators/evento.validator';
import { AppError } from '../utils/AppError';

export const updateEvento = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { 
      titulo, descricao, clienteId, dataInicio, dataFim, status, valor, 
      brinquedos, funcionarios,
      endereco, numero, bairro, cidade, estado 
    } = updateEventoSchema.parse(req.body);
    const empresaId = req.user?.empresaId;
    if (!empresaId) throw new AppError('Unauthorized', 401);

    const evento = await prisma.evento.findUnique({
      where: { id },
      include: {
        brinquedos: true,
        funcionarios: true,
      },
    });

    if (!evento || evento.empresaId !== empresaId) {
      throw new AppError('Evento não encontrado', 404);
    }

    // Validate brinquedos if provided
    if (brinquedos && brinquedos.length > 0) {
      const brinquedoIds = brinquedos.map(b => b.brinquedoId);
      const existingBrinquedos = await prisma.brinquedo.findMany({
        where: {
          id: { in: brinquedoIds },
          empresaId,
        },
      });
      if (existingBrinquedos.length !== brinquedoIds.length) {
        throw new AppError('Um ou mais brinquedos não encontrados ou não pertencem a esta empresa');
      }
    }

    // Validate funcionarios if provided
    if (funcionarios && funcionarios.length > 0) {
      const existingFuncionarios = await prisma.funcionario.findMany({
        where: {
          id: { in: funcionarios },
          empresaId,
        },
      });
      if (existingFuncionarios.length !== funcionarios.length) {
        throw new AppError('Um ou mais funcionários não encontrados ou não pertencem a esta empresa');
      }
    }

    // Check cliente if provided
    if (clienteId) {
      const cliente = await prisma.cliente.findUnique({
        where: { id: clienteId },
      });
      if (!cliente || cliente.empresaId !== empresaId) {
        throw new AppError('Cliente não encontrado');
      }
    }

    // Validação de Funcionários Necessários para Atualização
    if (brinquedos && brinquedos.length > 0) {
      const brinquedoIds = brinquedos.map(b => b.brinquedoId);
      const brinquedosDB = await prisma.brinquedo.findMany({
        where: { id: { in: brinquedoIds } }
      });

      let totalFuncNecessarios = 0;
      brinquedos.forEach(b => {
        const toy = brinquedosDB.find(t => t.id === b.brinquedoId);
        if (toy?.necessita_funcionario) {
          totalFuncNecessarios += b.quantidade;
        }
      });

      const totalFuncEscalados = funcionarios?.length || 0;

      if (totalFuncEscalados < totalFuncNecessarios) {
        throw new AppError(`Funcionários insuficientes. O evento necessita de pelo menos ${totalFuncNecessarios} funcionário(s) para os brinquedos selecionados.`);
      }
    }

    const updatedEvento = await prisma.evento.update({
      where: { id },
      data: {
        titulo,
        descricao,
        clienteId,
        dataInicio: dataInicio ? new Date(dataInicio) : undefined,
        dataFim: dataFim ? new Date(dataFim) : undefined,
        status,
        valorTotal: valor,
        // Endereço
        endereco,
        numero,
        bairro,
        cidade,
        estado,
        brinquedos: brinquedos ? {
          deleteMany: {},
          create: brinquedos.map(b => ({
            brinquedoId: b.brinquedoId,
            quantidade: b.quantidade,
          })),
        } : undefined,
        funcionarios: funcionarios ? {
          deleteMany: {},
          create: funcionarios.map(id => ({
            funcionarioId: id,
          })),
        } : undefined,
      },
      include: {
        brinquedos: {
          include: { brinquedo: true }
        },
        funcionarios: {
          include: { funcionario: true }
        },
      },
    });

    req.log.info({
      action: 'update_event',
      empresaId,
      usuarioId: req.user?.id,
      eventoId: updatedEvento.id,
      titulo: updatedEvento.titulo
    }, 'Evento atualizado com sucesso');

    await auditService.log({
      empresaId,
      userId: req.user?.id,
      action: 'UPDATE',
      resource: 'Evento',
      resourceId: updatedEvento.id,
      details: {
        changes: req.body
      },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.json({ success: true, data: updatedEvento });
  } catch (error) {
    next(error);
  }
};

export const listEventos = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { start, end } = req.query;
    const empresaId = req.user?.empresaId;
    if (!empresaId) throw new AppError('Unauthorized', 401);

    const where: any = { empresaId };

    if (start && end) {
      where.dataInicio = {
        gte: new Date(String(start)),
      };
      where.dataFim = {
        lte: new Date(String(end)),
      };
    }

    const eventos = await prisma.evento.findMany({
      where,
      include: {
        cliente: {
          select: { nome: true },
        },
        brinquedos: {
          include: {
            brinquedo: true
          }
        },
        funcionarios: {
          include: {
            funcionario: true
          }
        }
      },
    });

    const formattedEventos = eventos.map(evento => ({
      id: evento.id,
      titulo: evento.titulo,
      start: evento.dataInicio,
      end: evento.dataFim,
      status: evento.status,
      createdAt: evento.createdAt,
      cliente: evento.cliente,
      valor: evento.valorTotal ? Number(evento.valorTotal) : 0,
      endereco: evento.endereco,
      numero: evento.numero,
      bairro: evento.bairro,
      cidade: evento.cidade,
      estado: evento.estado,
      brinquedos: evento.brinquedos.map(eb => ({
        ...eb.brinquedo,
        quantidade: eb.quantidade
      })),
      funcionarios: evento.funcionarios.map(ef => ({
        ...ef.funcionario
      }))
      // FullCalendar expects 'title', 'start', 'end'
    }));

    res.json({ success: true, data: formattedEventos });
  } catch (error) {
    next(error);
  }
};

export const createEvento = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { 
      titulo, descricao, clienteId, dataInicio, dataFim, brinquedos, funcionarios, valor,
      endereco, numero, bairro, cidade, estado
    } = createEventoSchema.parse(req.body);
    const empresaId = req.user?.empresaId;
    if (!empresaId) throw new AppError('Unauthorized', 401);

    // Validate if brinquedos exist and belong to the company
    if (brinquedos && brinquedos.length > 0) {
      const brinquedoIds = brinquedos.map(b => b.brinquedoId);
      const existingBrinquedos = await prisma.brinquedo.findMany({
        where: {
          id: { in: brinquedoIds },
          empresaId,
        },
      });
      if (existingBrinquedos.length !== brinquedoIds.length) {
        throw new AppError('Um ou mais brinquedos não encontrados ou não pertencem a esta empresa');
      }
    }

    // Validate if funcionarios exist and belong to the company
    if (funcionarios && funcionarios.length > 0) {
      const existingFuncionarios = await prisma.funcionario.findMany({
        where: {
          id: { in: funcionarios },
          empresaId,
        },
      });
      if (existingFuncionarios.length !== funcionarios.length) {
        throw new AppError('Um ou mais funcionários não encontrados ou não pertencem a esta empresa');
      }
    }
    
    // Check cliente
    const cliente = await prisma.cliente.findUnique({
      where: { id: clienteId },
    });
    
    if (!cliente || cliente.empresaId !== empresaId) {
        throw new AppError('Cliente não encontrado');
    }

    // Validação de Funcionários Necessários
    if (brinquedos && brinquedos.length > 0) {
      const brinquedoIds = brinquedos.map(b => b.brinquedoId);
      const brinquedosDB = await prisma.brinquedo.findMany({
        where: { id: { in: brinquedoIds } }
      });

      let totalFuncNecessarios = 0;
      brinquedos.forEach(b => {
        const toy = brinquedosDB.find(t => t.id === b.brinquedoId);
        if (toy?.necessita_funcionario) {
          totalFuncNecessarios += b.quantidade;
        }
      });

      const totalFuncEscalados = funcionarios?.length || 0;

      if (totalFuncEscalados < totalFuncNecessarios) {
        throw new AppError(`Funcionários insuficientes. O evento necessita de pelo menos ${totalFuncNecessarios} funcionário(s) para os brinquedos selecionados.`);
      }
    }

    const evento = await prisma.evento.create({
      data: {
        titulo,
        descricao,
        clienteId,
        empresaId,
        dataInicio: new Date(dataInicio),
        dataFim: new Date(dataFim),
        valorTotal: valor, // Mapeando 'valor' (input) para 'valorTotal' (banco)
        // Endereço
        endereco,
        numero,
        bairro,
        cidade,
        estado,
        brinquedos: {
          create: brinquedos?.map(b => ({
            brinquedoId: b.brinquedoId,
            quantidade: b.quantidade,
          })),
        },
        funcionarios: {
          create: funcionarios?.map(id => ({
            funcionarioId: id,
          })),
        },
      },
      include: {
        brinquedos: true,
        funcionarios: true,
      },
    });

    req.log.info({
      action: 'create_event',
      empresaId,
      usuarioId: req.user?.id,
      eventoId: evento.id,
      titulo: evento.titulo
    }, 'Evento criado com sucesso');

    res.status(201).json({ success: true, data: evento });
  } catch (error) {
    next(error);
  }
};

export const getEvento = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const empresaId = req.user?.empresaId;
    if (!empresaId) throw new AppError('Unauthorized', 401);

    const evento = await prisma.evento.findUnique({
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
      throw new AppError('Evento não encontrado', 404);
    }

    res.json({ success: true, data: evento });
  } catch (error) {
    next(error);
  }
};

export const updateStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status } = updateStatusSchema.parse(req.body);
    const empresaId = req.user?.empresaId;
    if (!empresaId) throw new AppError('Unauthorized', 401);

    const evento = await prisma.evento.findUnique({
      where: { id },
    });

    if (!evento || evento.empresaId !== empresaId) {
      throw new AppError('Evento não encontrado', 404);
    }

    const updatedEvento = await prisma.evento.update({
      where: { id },
      data: { status },
    });

    await auditService.log({
      empresaId,
      userId: req.user?.id,
      action: 'UPDATE_STATUS',
      resource: 'Evento',
      resourceId: updatedEvento.id,
      details: { status },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.json({ success: true, data: updatedEvento });
  } catch (error) {
    next(error);
  }
};

export const concluirEvento = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const empresaId = req.user?.empresaId;
    if (!empresaId) throw new AppError('Unauthorized', 401);

    const evento = await prisma.evento.findUnique({
      where: { id },
    });

    if (!evento || evento.empresaId !== empresaId) {
      throw new AppError('Evento não encontrado', 404);
    }

    const updatedEvento = await prisma.evento.update({
      where: { id },
      data: { status: 'CONCLUIDO' },
    });

    await auditService.log({
      empresaId,
      userId: req.user?.id,
      action: 'CONCLUDE',
      resource: 'Evento',
      resourceId: updatedEvento.id,
      details: { status: 'CONCLUIDO' },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.json({ success: true, data: updatedEvento });
  } catch (error) {
    next(error);
  }
};

export const deleteEvento = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const empresaId = req.user?.empresaId;
    if (!empresaId) throw new AppError('Unauthorized', 401);

    const evento = await prisma.evento.findUnique({
      where: { id },
    });

    if (!evento || evento.empresaId !== empresaId) {
      throw new AppError('Evento não encontrado', 404);
    }

    await prisma.evento.delete({
      where: { id },
    });

    await auditService.log({
      empresaId,
      userId: req.user?.id,
      action: 'DELETE',
      resource: 'Evento',
      resourceId: id,
      details: { titulo: evento.titulo },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.status(200).json({ success: true, message: 'Evento excluído com sucesso' });
  } catch (error) {
    next(error);
  }
};
