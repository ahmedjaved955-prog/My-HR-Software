import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes.js';
import employeeRoutes from '../modules/employees/employee.routes.js';
import attendanceRoutes from '../modules/attendance/attendance.routes.js';
import leaveRoutes from '../modules/leaves/leave.routes.js';
import payrollRoutes from '../modules/payroll/payroll.routes.js';
import performanceRoutes from '../modules/performance/performance.routes.js';
import recruitmentRoutes from '../modules/recruitment/recruitment.routes.js';
import trainingRoutes from '../modules/trainings/training.routes.js';
import documentRoutes from '../modules/documents/document.routes.js';
import dashboardRoutes from '../modules/dashboard/dashboard.routes.js';
import settingsRoutes from '../modules/settings/settings.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/employees', employeeRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/leaves', leaveRoutes);
router.use('/payroll', payrollRoutes);
router.use('/performance', performanceRoutes);
router.use('/recruitment', recruitmentRoutes);
router.use('/trainings', trainingRoutes);
router.use('/documents', documentRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/settings', settingsRoutes);

export default router;
