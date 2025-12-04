import { Router } from 'express';
import { authenticate } from '../../middleware/authMiddleware.js';
import { authorize } from '../../middleware/roleMiddleware.js';
import { ROLES } from '../../config/roles.js';
import {
  checkInController,
  checkOutController,
  listAttendanceController,
} from './attendance.controller.js';

const router = Router();

router.use(authenticate);

router.post('/check-in', authorize([ROLES.EMPLOYEE, ROLES.HR, ROLES.ADMIN]), checkInController);
router.post('/check-out', authorize([ROLES.EMPLOYEE, ROLES.HR, ROLES.ADMIN]), checkOutController);
router.get('/', authorize([ROLES.HR, ROLES.ADMIN]), listAttendanceController);

export default router;
