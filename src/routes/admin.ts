import { Router } from 'express';

const router = Router();

import { login } from '../controllers/admin.js';
router.post('/auth/login', login);

export default router;
