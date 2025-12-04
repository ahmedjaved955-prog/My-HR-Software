import { Router } from 'express';
import { authenticate } from '../../middleware/authMiddleware.js';
import { authorize } from '../../middleware/roleMiddleware.js';
import { ROLES } from '../../config/roles.js';
import { upload } from '../../config/upload.js';
import {
  uploadDocumentController,
  listDocumentsController,
  downloadDocumentController,
} from './document.controller.js';

const router = Router();

router.use(authenticate);

router.post(
  '/:employeeId',
  authorize([ROLES.ADMIN, ROLES.HR]),
  upload.single('file'),
  uploadDocumentController
);

router.get('/', authorize([ROLES.ADMIN, ROLES.HR]), listDocumentsController);
router.get('/:id/download', authorize([ROLES.ADMIN, ROLES.HR, ROLES.EMPLOYEE]), downloadDocumentController);

export default router;
