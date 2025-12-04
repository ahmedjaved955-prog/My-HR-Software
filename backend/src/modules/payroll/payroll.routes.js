import { Router } from 'express';
import { authenticate } from '../../middleware/authMiddleware.js';
import { authorize } from '../../middleware/roleMiddleware.js';
import { ROLES } from '../../config/roles.js';
import {
  generatePayrollController,
  listPayrollController,
  myPayrollController,
  getPayrollController,
  downloadSlipController,
} from './payroll.controller.js';

const router = Router();

router.use(authenticate);

router.post('/generate', authorize([ROLES.ADMIN, ROLES.HR]), generatePayrollController);
router.get('/', authorize([ROLES.ADMIN, ROLES.HR]), listPayrollController);
router.get('/my', authorize([ROLES.EMPLOYEE, ROLES.HR, ROLES.ADMIN]), myPayrollController);
router.get('/:id', authorize([ROLES.ADMIN, ROLES.HR]), getPayrollController);
router.get('/:id/slip', authorize([ROLES.ADMIN, ROLES.HR, ROLES.EMPLOYEE]), downloadSlipController);

export default router;
