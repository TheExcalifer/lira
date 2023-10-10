import { Router } from 'express';

const router = Router();

import isUserAuth from '../middleware/is-user-auth.js';

import { signup, login, getProduct, getCategories, getProductsByFilter, addToCart } from '../controllers/lira.js';
router.post('/auth/login', login);
router.post('/auth/signup', signup);

router.post('/products-filter', getProductsByFilter);
router.get('/product/:slug', getProduct);

router.get('/categories', getCategories);

router.put('/add-to-cart', isUserAuth, addToCart);
export default router;
