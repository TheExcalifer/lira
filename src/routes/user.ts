import { Router } from 'express';

const router = Router();
import isUserAuth from '../middleware/is-user-auth.js';

import { changePassword } from '../controllers/user.js';

router.patch('/change-password', isUserAuth, changePassword);

export default router;
