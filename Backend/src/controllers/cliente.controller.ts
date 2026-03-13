import { Request, Response } from 'express';
import prisma from '../prisma';
import { z } from 'zod';
import { auditService } from '../services/audit.service';

const createClienteSchema = z.object({
  nome: z.string().min(3),
  telefone: z.string().min(8),
  cidade: z.string().min(3),
});

export const listClientes = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);
    const empresaId = req.user?.empresaId;

    if (!empresaId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const where: any = {
      empresaId,
    };

    if (search) {
      where.OR = [
        { nome: { contains: String(search), mode: 'insensitive' } },
        { cidade: { contains: String(search), mode: 'insensitive' } },
      ];
    }

    const [clientes, total] = await prisma.$transaction([
      prisma.cliente.findMany({
        where,
        skip,
        take,
        orderBy: { nome: 'asc' },
      }),
      prisma.cliente.count({ where }),
    ]);

    res.json({
      data: clientes,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createCliente = async (req: Request, res: Response) => {
  try {
    const { nome, telefone, cidade } = createClienteSchema.parse(req.body);
    const empresaId = req.user?.empresaId;

    if (!empresaId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const cliente = await prisma.cliente.create({
      data: {
        nome,
        telefone,
        cidade,
        empresaId,
      },
    });

    await auditService.log({
      empresaId,
      userId: req.user?.id,
      action: 'CREATE',
      resource: 'Cliente',
      resourceId: cliente.id.toString(),
      details: { nome, cidade },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    req.log.info({
      action: 'create_cliente',
      empresaId,
      usuarioId: req.user?.id,
      clienteId: cliente.id,
      nome: cliente.nome
    }, 'Cliente criado com sucesso');

    res.status(201).json(cliente);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        statusCode: 400,
        message: 'Validation Error',
        errors: error.errors.map(e => e.message),
      });
    }
    console.error(error);
    res.status(500).json({
      statusCode: 500,
      message: 'Internal server error',
      errors: [(error as Error).message]
    });
  }
};

export const getCliente = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const empresaId = req.user?.empresaId;

    if (!empresaId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const cliente = await prisma.cliente.findUnique({
      where: { id: Number(id) },
    });

    if (!cliente || cliente.empresaId !== empresaId) {
      return res.status(404).json({ message: 'Cliente not found' });
    }

    res.json(cliente);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      statusCode: 500,
      message: 'Internal server error',
      errors: [(error as Error).message]
    });
  }
};

export const updateCliente = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { nome, telefone, cidade } = createClienteSchema.parse(req.body);
    const empresaId = req.user?.empresaId;

    if (!empresaId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const cliente = await prisma.cliente.findUnique({
      where: { id: Number(id) },
    });

    if (!cliente || cliente.empresaId !== empresaId) {
      return res.status(404).json({ message: 'Cliente not found' });
    }

    const updatedCliente = await prisma.cliente.update({
      where: { id: Number(id) },
      data: {
        nome,
        telefone,
        cidade,
      },
    });

    await auditService.log({
      empresaId,
      userId: req.user?.id,
      action: 'UPDATE',
      resource: 'Cliente',
      resourceId: updatedCliente.id.toString(),
      details: {
        changes: req.body
      },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    req.log.info({
      action: 'update_cliente',
      empresaId,
      usuarioId: req.user?.id,
      clienteId: updatedCliente.id,
      nome: updatedCliente.nome
    }, 'Cliente atualizado com sucesso');

    res.json(updatedCliente);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        statusCode: 400,
        message: 'Validation Error',
        errors: error.errors.map(e => e.message),
      });
    }
    console.error(error);
    res.status(500).json({
      statusCode: 500,
      message: 'Internal server error',
      errors: [(error as Error).message]
    });
  }
};

export const deleteCliente = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const empresaId = req.user?.empresaId;

    if (!empresaId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const cliente = await prisma.cliente.findUnique({
      where: { id: Number(id) },
    });

    if (!cliente || cliente.empresaId !== empresaId) {
      return res.status(404).json({ message: 'Cliente not found' });
    }

    await prisma.cliente.delete({
      where: { id: Number(id) },
    });

    await auditService.log({
      empresaId,
      userId: req.user?.id,
      action: 'DELETE',
      resource: 'Cliente',
      resourceId: id,
      details: { nome: cliente.nome },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    req.log.info({
      action: 'delete_cliente',
      empresaId,
      usuarioId: req.user?.id,
      clienteId: Number(id),
      nome: cliente.nome
    }, 'Cliente excluído com sucesso');

    res.status(200).json({ message: 'Cliente excluído com sucesso' });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      statusCode: 500,
      message: 'Internal server error',
      errors: [(error as Error).message]
    });
  }
};
