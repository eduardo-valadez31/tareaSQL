import { Router } from 'express';
import productsRoutes from './products.routes';

const router = Router();

router.use('/v1/products', productsRoutes);

export default router;