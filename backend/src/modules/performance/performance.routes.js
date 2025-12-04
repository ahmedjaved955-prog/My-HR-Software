import { Router } from 'express';
import { authenticate } from '../../middleware/authMiddleware.js';
import { authorize } from '../../middleware/roleMiddleware.js';
import { ROLES } from '../../config/roles.js';
import {
  listKpisController,
  createKpiController,
  createPerformanceController,
  listPerformanceController,
  listMyPerformanceController,
} from './performance.controller.js';

const router = Router();

router.use(authenticate);

router.get('/kpis', authorize([ROLES.ADMIN, ROLES.HR]), listKpisController);
router.post('/kpis', authorize([ROLES.ADMIN, ROLES.HR]), createKpiController);

router.post('/', authorize([ROLES.ADMIN, ROLES.HR]), createPerformanceController);
router.get('/', authorize([ROLES.ADMIN, ROLES.HR]), listPerformanceController);
router.get('/my', authorize([ROLES.EMPLOYEE, ROLES.HR, ROLES.ADMIN]), listMyPerformanceController);

export default router;
