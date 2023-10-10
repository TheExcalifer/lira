import { Router } from 'express';

const router = Router();
import isUserAuth from '../middleware/is-user-auth.js';

import { changePassword, getCart } from '../controllers/user.js';

router.patch('/change-password', isUserAuth, changePassword);
router.get('/cart', isUserAuth, getCart);

export default router;
