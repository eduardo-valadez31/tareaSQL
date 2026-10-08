import { Router } from 'express';
import { ProductController } from '../controllers/products.controller';

const router = Router();
const controller = new ProductController();

router.get('/getAll', controller.getAll);
router.get('/getById/:id', controller.getById);
router.post('/create', controller.create);
router.put('/update/:id', controller.update);
router.delete('/delete/:id', controller.delete);
router.patch('/change-price/:id', controller.changePrice);

export default router;