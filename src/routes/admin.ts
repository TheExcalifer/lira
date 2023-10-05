import { Router } from 'express';
const router = Router();

import multer from 'multer';
const upload = multer({ storage: multer.memoryStorage() });

import isAdminAuth from '../middleware/is-admin-auth.js';
import { login, changePassword, createCategory, CreateProduct, createEntity } from '../controllers/admin.js';
router.post('/auth/login', login);
router.patch('/change-password', isAdminAuth, changePassword);
router.post('/create-category', isAdminAuth, createCategory);
router.post('/create-product', isAdminAuth, upload.array('productImages'), CreateProduct);
router.post('/create-entity', isAdminAuth, createEntity);

export default router;
