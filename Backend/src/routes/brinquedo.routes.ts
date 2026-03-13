import { Router } from 'express';
import { listBrinquedos, createBrinquedo, getBrinquedo, updateBrinquedo, deleteBrinquedo } from '../controllers/brinquedo.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/', listBrinquedos);
router.post('/', createBrinquedo);
router.get('/:id', getBrinquedo);
router.put('/:id', updateBrinquedo);
router.patch('/:id', updateBrinquedo);
router.delete('/:id', deleteBrinquedo);

export default router;
