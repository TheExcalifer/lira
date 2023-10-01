import { Router } from 'express';

const router = Router();
import isAdminAuth from '../middleware/is-admin-auth.js';
import { login, changePassword } from '../controllers/admin.js';
router.patch('/change-password', isAdminAuth,changePassword);
router.post('/auth/login', login);

export default router;
