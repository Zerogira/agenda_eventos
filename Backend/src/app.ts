import express from 'express';
import cors from 'cors';
import pinoHttp from 'pino-http';
import { logger } from './utils/logger';
import authRoutes from './routes/auth.routes';
import clienteRoutes from './routes/cliente.routes';
import funcionarioRoutes from './routes/funcionario.routes';
import brinquedoRoutes from './routes/brinquedo.routes';
import eventoRoutes from './routes/evento.routes';
import adminRoutes from './routes/admin.routes';
import auditRoutes from './routes/audit.routes';
import { errorHandler } from './middlewares/error.middleware';

const app = express();

app.use(cors());
app.use(express.json());

// Request logging middleware
app.use(pinoHttp({
  logger,
  // Define custom serializers if needed, or stick to defaults which are good
  serializers: {
    req: (req) => ({
      method: req.method,
      url: req.url,
      // body: req.raw.body, // Be careful with sensitive data in body
    }),
    res: (res) => ({
      statusCode: res.statusCode,
    }),
  },
  // Quiet logs for health checks or static assets if any
  autoLogging: {
    ignore: (req) => req.url === '/health' || req.url === '/favicon.ico',
  },
}));

app.use('/api/auth', authRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/funcionarios', funcionarioRoutes);
app.use('/api/brinquedos', brinquedoRoutes);
app.use('/api/eventos', eventoRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/system-logs', auditRoutes); // Changed from /audit to avoid AdBlockers


app.use(errorHandler);

export default app;
