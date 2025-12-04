import { Router } from 'express';
import { authenticate } from '../../middleware/authMiddleware.js';
import { authorize } from '../../middleware/roleMiddleware.js';
import { ROLES } from '../../config/roles.js';
import {
  createTrainingController,
  listTrainingsController,
  getTrainingController,
  enrolMeController,
  completeEnrolmentController,
  listEnrolmentsController,
  listMyEnrolmentsController,
} from './training.controller.js';

const router = Router();

router.use(authenticate);

router.post('/', authorize([ROLES.ADMIN, ROLES.HR]), createTrainingController);
router.get('/', authorize([ROLES.ADMIN, ROLES.HR, ROLES.EMPLOYEE]), listTrainingsController);
router.get('/:id', authorize([ROLES.ADMIN, ROLES.HR, ROLES.EMPLOYEE]), getTrainingController);
router.post('/:id/enrol', authorize([ROLES.ADMIN, ROLES.HR, ROLES.EMPLOYEE]), enrolMeController);
router.post('/:trainingId/enrolments/:employeeId/complete', authorize([ROLES.ADMIN, ROLES.HR]), completeEnrolmentController);
router.get('/enrolments', authorize([ROLES.ADMIN, ROLES.HR]), listEnrolmentsController);
router.get('/my/enrolments', authorize([ROLES.ADMIN, ROLES.HR, ROLES.EMPLOYEE]), listMyEnrolmentsController);

export default router;
