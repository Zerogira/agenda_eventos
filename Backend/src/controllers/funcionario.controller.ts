import { Request, Response } from 'express';
import prisma from '../prisma';
import { z } from 'zod';

const createFuncionarioSchema = z.object({
  nome: z.string().min(3),
  cpf: z.string().min(11),
  telefone: z.string().min(8),
  ativo: z.boolean().optional(),
});

export const listFuncionarios = async (req: Request, res: Response) => {
  try {
    const empresaId = req.user?.empresaId;
    if (!empresaId) return res.status(401).json({ message: 'Unauthorized' });

    const funcionarios = await prisma.funcionario.findMany({
      where: { empresaId },
      orderBy: { nome: 'asc' },
    });

    res.json(funcionarios);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createFuncionario = async (req: Request, res: Response) => {
  try {
    const { nome, cpf, telefone, ativo } = createFuncionarioSchema.parse(req.body);
    const empresaId = req.user?.empresaId;
    if (!empresaId) return res.status(401).json({ message: 'Unauthorized' });

    const funcionario = await prisma.funcionario.create({
      data: {
        nome,
        cpf,
        telefone,
        ativo: ativo ?? true,
        empresaId,
      },
    });

    req.log.info({
      action: 'create_funcionario',
      empresaId,
      usuarioId: req.user?.id,
      funcionarioId: funcionario.id,
      nome: funcionario.nome
    }, 'Funcionário criado com sucesso');
    res.status(201).json(funcionario);
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

export const getFuncionario = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const empresaId = req.user?.empresaId;

    if (!empresaId) return res.status(401).json({ message: 'Unauthorized' });

    const funcionario = await prisma.funcionario.findUnique({
      where: { id: Number(id) },
    });

    if (!funcionario || funcionario.empresaId !== empresaId) {
      return res.status(404).json({ message: 'Funcionário not found' });
    }

    res.json(funcionario);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      statusCode: 500,
      message: 'Internal server error',
      errors: [(error as Error).message]
    });
  }
};

export const updateFuncionario = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { nome, cpf, telefone, ativo } = createFuncionarioSchema.parse(req.body);
    const empresaId = req.user?.empresaId;

    if (!empresaId) return res.status(401).json({ message: 'Unauthorized' });

    const funcionario = await prisma.funcionario.findUnique({
      where: { id: Number(id) },
    });

    if (!funcionario || funcionario.empresaId !== empresaId) {
      return res.status(404).json({ message: 'Funcionário not found' });
    }

    const updatedFuncionario = await prisma.funcionario.update({
      where: { id: Number(id) },
      data: {
        nome,
        cpf,
        telefone,
        ativo: ativo ?? true,
      },
    });

    req.log.info({
      action: 'update_funcionario',
      empresaId,
      usuarioId: req.user?.id,
      funcionarioId: updatedFuncionario.id,
      nome: updatedFuncionario.nome
    }, 'Funcionário atualizado com sucesso');
    res.json(updatedFuncionario);
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

export const deleteFuncionario = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const empresaId = req.user?.empresaId;

    if (!empresaId) return res.status(401).json({ message: 'Unauthorized' });

    const funcionario = await prisma.funcionario.findUnique({
      where: { id: Number(id) },
    });

    if (!funcionario || funcionario.empresaId !== empresaId) {
      return res.status(404).json({ message: 'Funcionário not found' });
    }

    await prisma.funcionario.delete({
      where: { id: Number(id) },
    });

    req.log.info({
      action: 'delete_funcionario',
      empresaId,
      usuarioId: req.user?.id,
      funcionarioId: Number(id),
      nome: funcionario.nome
    }, 'Funcionário excluído com sucesso');
    res.status(200).json({ message: 'Funcionário excluído com sucesso' });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      statusCode: 500,
      message: 'Internal server error',
      errors: [(error as Error).message]
    });
  }
};
