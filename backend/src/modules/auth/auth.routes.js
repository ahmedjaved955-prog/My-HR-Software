import { Router } from 'express';
import { register, loginController, refreshController } from './auth.controller.js';

const router = Router();

router.post('/register', register);
router.post('/login', loginController);
router.post('/refresh', refreshController);

export default router;
