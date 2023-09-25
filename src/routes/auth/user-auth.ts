import { Router } from 'express';

const router = Router();

import { signup, login } from '../../controllers/auth/user-auth.js';
router.post('/login', login);
router.put('/signup', signup);

export default router;
