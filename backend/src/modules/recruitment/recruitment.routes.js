import { Router } from 'express';
import { authenticate } from '../../middleware/authMiddleware.js';
import { authorize } from '../../middleware/roleMiddleware.js';
import { ROLES } from '../../config/roles.js';
import {
  createJobController,
  listJobsController,
  getJobController,
  createApplicantController,
  listApplicantsController,
  updateApplicantStatusController,
  scheduleInterviewController,
  offerLetterController,
} from './recruitment.controller.js';

const router = Router();

router.use(authenticate);

router.post('/jobs', authorize([ROLES.ADMIN, ROLES.HR]), createJobController);
router.get('/jobs', authorize([ROLES.ADMIN, ROLES.HR, ROLES.EMPLOYEE]), listJobsController);
router.get('/jobs/:id', authorize([ROLES.ADMIN, ROLES.HR, ROLES.EMPLOYEE]), getJobController);

router.post('/applicants', authorize([ROLES.ADMIN, ROLES.HR]), createApplicantController);
router.get('/applicants', authorize([ROLES.ADMIN, ROLES.HR]), listApplicantsController);
router.patch('/applicants/:id/status', authorize([ROLES.ADMIN, ROLES.HR]), updateApplicantStatusController);
router.post('/applicants/:id/schedule', authorize([ROLES.ADMIN, ROLES.HR]), scheduleInterviewController);
router.get('/applicants/:id/offer-letter', authorize([ROLES.ADMIN, ROLES.HR]), offerLetterController);

export default router;
