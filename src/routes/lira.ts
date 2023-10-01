import { Router } from 'express';

const router = Router();

import { signup, login, getProduct } from '../controllers/lira.js';
router.post('/auth/login', login);
router.post('/auth/signup', signup);
router.get('/product/:slug', getProduct);

export default router;
