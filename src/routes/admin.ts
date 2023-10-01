import { Router } from 'express';

const router = Router();
import isAdminAuth from '../middleware/is-admin-auth.js';
import { login, changePassword, createCategory } from '../controllers/admin.js';
router.post('/auth/login', login);
router.patch('/change-password', isAdminAuth, changePassword);
router.post('/create-category', isAdminAuth, createCategory);

export default router;
