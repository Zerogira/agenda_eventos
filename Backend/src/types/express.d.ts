import { UserPayload } from './auth';
import { Logger } from 'pino';

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
      log: Logger;
    }
  }
}
