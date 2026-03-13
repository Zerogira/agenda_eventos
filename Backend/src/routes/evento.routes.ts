import { Router } from 'express';
import { listEventos, createEvento, getEvento, updateStatus, updateEvento, deleteEvento, concluirEvento } from '../controllers/evento.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/', listEventos);
router.post('/', createEvento);
router.get('/:id', getEvento);
router.patch('/:id/status', updateStatus);
router.patch('/:id/concluir', concluirEvento);
router.put('/:id', updateEvento);
router.patch('/:id', updateEvento);
router.delete('/:id', deleteEvento);

export default router;
