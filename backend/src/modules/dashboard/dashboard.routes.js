import { Router } from 'express';
import { authenticate } from '../../middleware/authMiddleware.js';
import { authorize } from '../../middleware/roleMiddleware.js';
import { ROLES } from '../../config/roles.js';
import { getDashboardSummaryController } from './dashboard.controller.js';

const router = Router();

router.use(authenticate);

router.get('/', authorize([ROLES.ADMIN, ROLES.HR]), getDashboardSummaryController);

export default router;
