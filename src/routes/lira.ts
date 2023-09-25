import { Router } from 'express';

const router = Router();

import { signup, login } from '../controllers/lira.js';
router.post('/auth/login', login);
router.put('/auth/signup', signup);

export default router;
