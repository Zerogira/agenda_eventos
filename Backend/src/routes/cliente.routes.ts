import { Router } from 'express';
import { listClientes, createCliente, getCliente, updateCliente, deleteCliente } from '../controllers/cliente.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/', listClientes);
router.post('/', createCliente);
router.get('/:id', getCliente);
router.put('/:id', updateCliente);
router.patch('/:id', updateCliente);
router.delete('/:id', deleteCliente);

export default router;
