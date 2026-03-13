export interface UserPayload {
  id: string;
  email: string;
  role: string;
  empresaId: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}
