import { Request, Response } from 'express';
import prisma from '../prisma';
import { z } from 'zod';
import { auditService } from '../services/audit.service';

const createEmpresaSchema = z.object({
  nome: z.string().min(3),
  cnpj: z.string().optional(),
});

const updateEmpresaSchema = z.object({
  nome: z.string().min(3).optional(),
  cnpj: z.string().optional(),
  // status: z.enum(['ATIVA', 'INATIVA']).optional() // Assuming status field exists or will be added
});

const createConviteSchema = z.object({
  empresaId: z.string().uuid(),
  expiresInDays: z.number().min(1).default(30),
});

function generateInviteCode(length = 8) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export const createEmpresa = async (req: Request, res: Response) => {
  try {
    const { nome, cnpj } = createEmpresaSchema.parse(req.body);

    const result = await prisma.$transaction(async (prisma) => {
      // 1. Create Empresa
      const empresa = await prisma.empresa.create({
        data: {
          nome,
          cnpj,
        },
      });

      // 2. Generate Invite
      const codigo = generateInviteCode();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30); // Default 30 days

      // @ts-ignore
      const convite = await prisma.conviteEmpresa.create({
        data: {
          codigo,
          empresaId: empresa.id,
          expiresAt,
        },
      });

      return { empresa, convite };
    });

    await auditService.log({
      empresaId: result.empresa.id,
      userId: req.user?.id,
      action: 'CREATE',
      resource: 'Empresa',
      resourceId: result.empresa.id,
      details: { nome: result.empresa.nome, cnpj: result.empresa.cnpj },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.status(201).json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation Error', errors: error.errors });
    }
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const listEmpresas = async (req: Request, res: Response) => {
  try {
    const empresas = await prisma.empresa.findMany({
      include: {
        _count: {
          select: { usuarios: true, clientes: true, eventos: true }
        },
        // @ts-ignore
        convites: {
            where: { usado: false },
            select: { codigo: true, expiresAt: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(empresas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateEmpresa = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { nome, cnpj } = updateEmpresaSchema.parse(req.body);

    const empresa = await prisma.empresa.update({
      where: { id },
      data: { nome, cnpj },
    });

    await auditService.log({
      empresaId: empresa.id,
      userId: req.user?.id,
      action: 'UPDATE',
      resource: 'Empresa',
      resourceId: empresa.id,
      details: { changes: req.body },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.json(empresa);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation Error', errors: error.errors });
    }
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteEmpresa = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const empresa = await prisma.empresa.findUnique({ where: { id } });
    if (!empresa) return res.status(404).json({ message: 'Empresa not found' });

    await prisma.empresa.delete({ where: { id } });

    await auditService.log({
      empresaId: id,
      userId: req.user?.id,
      action: 'DELETE',
      resource: 'Empresa',
      resourceId: id,
      details: { nome: empresa.nome },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createConvite = async (req: Request, res: Response) => {
  try {
    const { empresaId, expiresInDays } = createConviteSchema.parse(req.body);

    const empresa = await prisma.empresa.findUnique({ where: { id: empresaId } });
    if (!empresa) {
        return res.status(404).json({ message: 'Empresa not found' });
    }

    const codigo = generateInviteCode();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    // @ts-ignore
    const convite = await prisma.conviteEmpresa.create({
      data: {
        codigo,
        empresaId,
        expiresAt,
      },
    });

    await auditService.log({
      empresaId: empresaId,
      userId: req.user?.id,
      action: 'CREATE_INVITE',
      resource: 'Admin',
      details: { codigo, empresa: empresa.nome },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.status(201).json(convite);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation Error', errors: error.errors });
    }
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const listConvites = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const convites = await prisma.conviteEmpresa.findMany({
            include: {
                empresa: {
                    select: { nome: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(convites);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getEmpresaDetails = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const empresa = await prisma.empresa.findUnique({
            where: { id },
            include: {
                usuarios: true,
                clientes: true,
                funcionarios: true,
                brinquedos: true,
            }
        });
        
        if (!empresa) {
            return res.status(404).json({ message: 'Empresa not found' });
        }

        res.json(empresa);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
