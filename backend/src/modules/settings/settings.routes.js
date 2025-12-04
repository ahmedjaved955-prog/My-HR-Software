import { Router } from 'express';
import { authenticate } from '../../middleware/authMiddleware.js';
import { authorize } from '../../middleware/roleMiddleware.js';
import { ROLES } from '../../config/roles.js';
import {
  getCompanySettingsController,
  updateCompanySettingsController,
  listUsersController,
  updateUserRoleController,
  updateUserStatusController,
  listAuditLogsController,
} from './settings.controller.js';

const router = Router();

router.use(authenticate);
router.use(authorize([ROLES.ADMIN]));

router.get('/company', getCompanySettingsController);
router.put('/company', updateCompanySettingsController);

router.get('/users', listUsersController);
router.patch('/users/:id/role', updateUserRoleController);
router.patch('/users/:id/status', updateUserStatusController);

router.get('/audit-logs', listAuditLogsController);

export default router;
