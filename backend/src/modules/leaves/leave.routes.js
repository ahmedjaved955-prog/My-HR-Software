import { Router } from 'express';
import { authenticate } from '../../middleware/authMiddleware.js';
import { authorize } from '../../middleware/roleMiddleware.js';
import { ROLES } from '../../config/roles.js';
import {
  applyLeaveController,
  listLeavesController,
  myLeavesController,
  approveLeaveController,
  leaveBalanceController,
} from './leave.controller.js';

const router = Router();

router.use(authenticate);

router.post('/apply', authorize([ROLES.EMPLOYEE, ROLES.HR, ROLES.ADMIN]), applyLeaveController);
router.get('/', authorize([ROLES.HR, ROLES.ADMIN]), listLeavesController);
router.get('/my', authorize([ROLES.EMPLOYEE, ROLES.HR, ROLES.ADMIN]), myLeavesController);
router.post('/:id/approve', authorize([ROLES.HR, ROLES.ADMIN]), approveLeaveController);
router.get('/balance', authorize([ROLES.EMPLOYEE, ROLES.HR, ROLES.ADMIN]), leaveBalanceController);

export default router;
