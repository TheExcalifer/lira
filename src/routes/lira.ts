import { Router } from 'express';

const router = Router();

import { signup, login, getProduct, getCategories, getProductsByFilter } from '../controllers/lira.js';
router.post('/auth/login', login);
router.post('/auth/signup', signup);

router.post('/products-filter', getProductsByFilter);
router.get('/product/:slug', getProduct);

router.get('/categories', getCategories);

export default router;
