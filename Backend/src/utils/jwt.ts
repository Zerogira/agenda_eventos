import jwt from 'jsonwebtoken';
import { UserPayload } from '../types/auth';

const SECRET = process.env.JWT_SECRET || 'secret';

export const generateToken = (payload: UserPayload): string => {
  return jwt.sign(payload, SECRET, { expiresIn: '1d' });
};

export const verifyToken = (token: string): UserPayload | null => {
  try {
    return jwt.verify(token, SECRET) as UserPayload;
  } catch (error) {
    return null;
  }
};
