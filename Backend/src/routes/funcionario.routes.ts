import { Router } from 'express';
import { listFuncionarios, createFuncionario, getFuncionario, updateFuncionario, deleteFuncionario } from '../controllers/funcionario.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/', listFuncionarios);
router.post('/', createFuncionario);
router.get('/:id', getFuncionario);
router.put('/:id', updateFuncionario);
router.patch('/:id', updateFuncionario);
router.delete('/:id', deleteFuncionario);

export default router;
