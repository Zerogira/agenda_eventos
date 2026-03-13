import { Request, Response, NextFunction } from 'express';
import prisma from '../prisma';
import { createBrinquedoSchema, updateBrinquedoSchema } from '../validators/brinquedo.validator';
import { AppError } from '../utils/AppError';

export const listBrinquedos = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const empresaId = req.user?.empresaId;
    if (!empresaId) throw new AppError('Unauthorized', 401);

    const brinquedos = await prisma.brinquedo.findMany({
      where: { empresaId },
      orderBy: { nome: 'asc' },
    });

    res.json({ success: true, data: brinquedos });
  } catch (error) {
    next(error);
  }
};

export const createBrinquedo = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = createBrinquedoSchema.parse(req.body);
    const empresaId = req.user?.empresaId;
    if (!empresaId) throw new AppError('Unauthorized', 401);

    const brinquedo = await prisma.brinquedo.create({
      data: {
        ...data,
        empresaId,
      },
    });

    req.log.info({
      action: 'create_brinquedo',
      empresaId,
      usuarioId: req.user?.id,
      brinquedoId: brinquedo.id,
      nome: brinquedo.nome
    }, 'Brinquedo criado com sucesso');

    res.status(201).json({ success: true, data: brinquedo });
  } catch (error) {
    next(error);
  }
};

export const getBrinquedo = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const empresaId = req.user?.empresaId;
    if (!empresaId) throw new AppError('Unauthorized', 401);

    const brinquedo = await prisma.brinquedo.findUnique({
      where: { id: Number(id) },
    });

    if (!brinquedo || brinquedo.empresaId !== empresaId) {
      throw new AppError('Brinquedo não encontrado', 404);
    }

    res.json({ success: true, data: brinquedo });
  } catch (error) {
    next(error);
  }
};

export const updateBrinquedo = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    // Use partial schema for updates, or full schema if you expect full replacement
    // Based on user request "campos obrigatórios devem ser verificados", usually PUT implies full replacement or validation of provided fields.
    // If the frontend sends the whole object, createBrinquedoSchema works.
    // However, for robust APIs, if I send only { nome: "Novo" }, it should work if it's PATCH.
    // Express doesn't strictly distinguish PUT/PATCH body validation unless we force it.
    // I'll use updateBrinquedoSchema which is partial, BUT check if mandatory fields are null in DB if creating? No, this is update.
    // If user wants to enforce "valorUnitario" is present, they should send it.
    // But if the frontend sends the whole object, createBrinquedoSchema is safer to ensure nothing is missing.
    // I will use createBrinquedoSchema because the previous code used it, implying full update.
    const data = createBrinquedoSchema.parse(req.body);
    
    const empresaId = req.user?.empresaId;
    if (!empresaId) throw new AppError('Unauthorized', 401);

    const brinquedo = await prisma.brinquedo.findUnique({
      where: { id: Number(id) },
    });

    if (!brinquedo || brinquedo.empresaId !== empresaId) {
      throw new AppError('Brinquedo não encontrado', 404);
    }

    const updatedBrinquedo = await prisma.brinquedo.update({
      where: { id: Number(id) },
      data: {
        ...data,
      },
    });

    req.log.info({
      action: 'update_brinquedo',
      empresaId,
      usuarioId: req.user?.id,
      brinquedoId: updatedBrinquedo.id,
      nome: updatedBrinquedo.nome
    }, 'Brinquedo atualizado com sucesso');

    res.json({ success: true, data: updatedBrinquedo });
  } catch (error) {
    next(error);
  }
};

export const deleteBrinquedo = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const empresaId = req.user?.empresaId;
    if (!empresaId) throw new AppError('Unauthorized', 401);

    const brinquedo = await prisma.brinquedo.findUnique({
      where: { id: Number(id) },
    });

    if (!brinquedo || brinquedo.empresaId !== empresaId) {
      throw new AppError('Brinquedo não encontrado', 404);
    }

    await prisma.brinquedo.delete({
      where: { id: Number(id) },
    });

    res.status(200).json({ success: true, message: 'Brinquedo excluído com sucesso' });
  } catch (error) {
    next(error);
  }
};
