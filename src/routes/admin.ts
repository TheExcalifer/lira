import { Router } from 'express';
const router = Router();

import multer from 'multer';
const upload = multer({ storage: multer.memoryStorage() });

import isAdminAuth from '../middleware/is-admin-auth.js';
import { login, changePassword, createCategory, CreateProduct } from '../controllers/admin.js';
router.post('/auth/login', login);
router.patch('/change-password', isAdminAuth, changePassword);
router.post('/create-category', isAdminAuth, createCategory);
router.post('/create-product', isAdminAuth, upload.single('data'), CreateProduct);

export default router;
