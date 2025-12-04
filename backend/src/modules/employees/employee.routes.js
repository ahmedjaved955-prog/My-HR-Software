import { Router } from 'express';
import { authenticate } from '../../middleware/authMiddleware.js';
import { authorize } from '../../middleware/roleMiddleware.js';
import { ROLES } from '../../config/roles.js';
import {
  getEmployees,
  getEmployee,
  createEmployeeController,
  updateEmployeeController,
  deleteEmployeeController,
} from './employee.controller.js';

const router = Router();

router.use(authenticate);

router.get('/', authorize([ROLES.ADMIN, ROLES.HR]), getEmployees);
router.get('/:id', authorize([ROLES.ADMIN, ROLES.HR, ROLES.EMPLOYEE]), getEmployee);
router.post('/', authorize([ROLES.ADMIN, ROLES.HR]), createEmployeeController);
router.put('/:id', authorize([ROLES.ADMIN, ROLES.HR]), updateEmployeeController);
router.delete('/:id', authorize([ROLES.ADMIN, ROLES.HR]), deleteEmployeeController);

export default router;
