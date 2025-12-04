import { query } from '../../config/db.js';
import {
  createTraining,
  listTrainings,
  getTraining,
  enrolEmployee,
  completeEnrolment,
  listEnrolments,
  listMyEnrolments,
} from './training.service.js';

async function getEmployeeIdForUser(companyId, userId) {
  const res = await query(
    `SELECT id FROM employees WHERE user_id = $1 AND company_id = $2`,
    [userId, companyId]
  );
  if (!res.rows.length) {
    throw Object.assign(new Error('Employee profile not found for user'), { status: 400 });
  }
  return res.rows[0].id;
}

export async function createTrainingController(req, res, next) {
  try {
    const companyId = req.user.company_id;
    const training = await createTraining(companyId, req.body);
    res.status(201).json(training);
  } catch (err) {
    next(err);
  }
}

export async function listTrainingsController(req, res, next) {
  try {
    const companyId = req.user.company_id;
    const trainings = await listTrainings(companyId);
    res.json(trainings);
  } catch (err) {
    next(err);
  }
}

export async function getTrainingController(req, res, next) {
  try {
    const companyId = req.user.company_id;
    const { id } = req.params;
    const training = await getTraining(companyId, id);
    if (!training) return res.status(404).json({ message: 'Training not found' });
    res.json(training);
  } catch (err) {
    next(err);
  }
}

export async function enrolMeController(req, res, next) {
  try {
    const companyId = req.user.company_id;
    const employeeId = await getEmployeeIdForUser(companyId, req.user.id);
    const { id } = req.params; // training id
    const enrolment = await enrolEmployee(companyId, id, employeeId);
    res.status(201).json(enrolment);
  } catch (err) {
    next(err);
  }
}

export async function completeEnrolmentController(req, res, next) {
  try {
    const companyId = req.user.company_id;
    const { trainingId, employeeId } = req.params;
    const enrolment = await completeEnrolment(companyId, trainingId, employeeId, req.body);
    if (!enrolment) return res.status(404).json({ message: 'Enrolment not found' });
    res.json(enrolment);
  } catch (err) {
    next(err);
  }
}

export async function listEnrolmentsController(req, res, next) {
  try {
    const companyId = req.user.company_id;
    const { trainingId, employeeId } = req.query;
    const data = await listEnrolments(companyId, { trainingId, employeeId });
    res.json(data);
  } catch (err) {
    next(err);
  }
}

export async function listMyEnrolmentsController(req, res, next) {
  try {
    const companyId = req.user.company_id;
    const data = await listMyEnrolments(companyId, req.user.id);
    res.json(data);
  } catch (err) {
    next(err);
  }
}
