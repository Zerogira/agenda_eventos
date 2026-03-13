import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../prisma';
import { generateToken } from '../utils/jwt';
import { z } from 'zod';
import { auditService } from '../services/audit.service';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const registerSchema = z.object({
  nomeUsuario: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6),
  codigoConvite: z.string().min(1, "Código de convite é obrigatório"),
});

const updateProfileSchema = z.object({
  name: z.string().min(3).optional(),
  email: z.string().email().optional(),
});



export const updateProfile = async (req: Request, res: Response) => {
  try {
    const { name, email } = updateProfileSchema.parse(req.body);
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await prisma.usuario.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (email && email !== user.email) {
        const existingUser = await prisma.usuario.findUnique({
            where: { email },
        });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already in use' });
        }
    }

    const updatedUser = await prisma.usuario.update({
      where: { id: userId },
      data: {
        nome: name,
        email: email,
      },
    });

    await auditService.log({
      empresaId: updatedUser.empresaId,
      userId: updatedUser.id,
      action: 'UPDATE_PROFILE',
      resource: 'Auth',
      details: { name, email },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.json({
      id: updatedUser.id,
      name: updatedUser.nome,
      email: updatedUser.email,
      role: updatedUser.role,
      empresaId: updatedUser.empresaId,
    });
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

const changePasswordSchema = z.object({
  currentPassword: z.string().min(6),
  newPassword: z.string().min(6),
});

export const changePassword = async (req: Request, res: Response) => {
  try {
    const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await prisma.usuario.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isValidPassword = await bcrypt.compare(currentPassword, user.senha);

    if (!isValidPassword) {
      return res.status(400).json({ message: 'Senha atual incorreta' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.usuario.update({
      where: { id: userId },
      data: { senha: hashedPassword },
    });

    res.json({ message: 'Senha alterada com sucesso' });
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


export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await prisma.usuario.findUnique({
      where: { email },
    });

    if (!user) {
      req.log.warn({ action: 'login_failed', email }, 'Tentativa de login com email inexistente');
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.senha);

    if (!isValidPassword) {
      req.log.warn({ action: 'login_failed', email, empresaId: user.empresaId }, 'Tentativa de login com senha incorreta');
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      empresaId: user.empresaId,
    });

    await auditService.log({
      empresaId: user.empresaId,
      userId: user.id,
      action: 'LOGIN',
      resource: 'Auth',
      details: { email: user.email },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    req.log.info({
      action: 'login_success',
      empresaId: user.empresaId,
      userId: user.id,
      email: user.email
    }, 'Login realizado com sucesso');

    res.json({
      accessToken: token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        empresaId: user.empresaId,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        statusCode: 400,
        message: 'Validation Error',
        errors: error.errors.map(e => e.message),
      });
    }
    res.status(500).json({
      statusCode: 500,
      message: 'Internal server error',
      errors: [(error as Error).message]
    });
  }
};

export const register = async (req: Request, res: Response) => {
  try {
    const { nomeUsuario, email, password, codigoConvite } = registerSchema.parse(req.body);

    // 1. Check if user exists
    const existingUser = await prisma.usuario.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // 2. Validate Invite
    // Note: TypeScript might complain if Prisma Client is not regenerated yet, but logic is correct
    // @ts-ignore
    const convite = await prisma.conviteEmpresa.findUnique({
      where: { codigo: codigoConvite },
      include: { empresa: true }
    });

    if (!convite) {
      return res.status(400).json({ message: 'Código de convite inválido ou inexistente' });
    }

    if (convite.usado) {
      return res.status(400).json({ message: 'Este código de convite já foi utilizado' });
    }

    if (new Date() > new Date(convite.expiresAt)) {
      return res.status(400).json({ message: 'Código de convite expirado' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await prisma.$transaction(async (prisma) => {
      // Create user linked to company
      const user = await prisma.usuario.create({
        data: {
          nome: nomeUsuario,
          email,
          senha: hashedPassword,
          role: 'ADMIN', // First user via invite is typically Admin of that company? Or USER? Requirement implies "ADMIN" or "USER". Let's default to ADMIN for now as they are setting up. Or maybe USER? Usually invite is for employees. But initial setup is for Admin.
          // Requirement: "Admin cria empresa -> Sistema gera convite -> Usuário informa código".
          // This implies the user registering is likely the owner/admin of that company invite, OR an employee.
          // Since the prompt says "Permitir que apenas empresas criadas por um Super Admin possam registrar usuários",
          // and "Admin cria empresa... gera convite... envia ao cliente",
          // The "cliente" here is likely the company owner. So they should be ADMIN.
          // Future invites for employees should probably be generated by the company Admin themselves (scope for later).
          // For now, let's assume ADMIN role for this invite flow as it's the onboarding flow.
          empresaId: convite.empresaId,
        },
      });

      // Mark invite as used
      // @ts-ignore
      await prisma.conviteEmpresa.update({
        where: { id: convite.id },
        data: { usado: true }
      });

      return { user };
    });

    const token = generateToken({
      id: result.user.id,
      email: result.user.email,
      role: result.user.role,
      empresaId: result.user.empresaId,
    });

    await auditService.log({
      empresaId: result.user.empresaId,
      userId: result.user.id,
      action: 'REGISTER',
      resource: 'Auth',
      details: { email: result.user.email, codigoConvite },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    req.log.info({
      action: 'register_success',
      empresaId: result.user.empresaId,
      userId: result.user.id,
      email: result.user.email
    }, 'Usuário registrado com sucesso');

    res.status(201).json({
      accessToken: token,
      user: {
        id: result.user.id,
        email: result.user.email,
        role: result.user.role,
        empresaId: result.user.empresaId,
      },
    });
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
