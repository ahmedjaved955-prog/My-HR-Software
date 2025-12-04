import PDFDocument from 'pdfkit';
import {
  createJob,
  listJobs,
  getJob,
  createApplicant,
  listApplicants,
  updateApplicantStatus,
  scheduleInterview,
  getApplicantWithJob,
} from './recruitment.service.js';

export async function createJobController(req, res, next) {
  try {
    const companyId = req.user.company_id;
    const job = await createJob(companyId, req.body);
    res.status(201).json(job);
  } catch (err) {
    next(err);
  }
}

export async function listJobsController(req, res, next) {
  try {
    const companyId = req.user.company_id;
    const jobs = await listJobs(companyId);
    res.json(jobs);
  } catch (err) {
    next(err);
  }
}

export async function getJobController(req, res, next) {
  try {
    const companyId = req.user.company_id;
    const { id } = req.params;
    const job = await getJob(companyId, id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json(job);
  } catch (err) {
    next(err);
  }
}

export async function createApplicantController(req, res, next) {
  try {
    const companyId = req.user.company_id;
    const applicant = await createApplicant(companyId, req.body);
    res.status(201).json(applicant);
  } catch (err) {
    next(err);
  }
}

export async function listApplicantsController(req, res, next) {
  try {
    const companyId = req.user.company_id;
    const { jobId } = req.query;
    const applicants = await listApplicants(companyId, { jobId });
    res.json(applicants);
  } catch (err) {
    next(err);
  }
}

export async function updateApplicantStatusController(req, res, next) {
  try {
    const companyId = req.user.company_id;
    const { id } = req.params;
    const { status } = req.body;
    const applicant = await updateApplicantStatus(companyId, id, status);
    if (!applicant) return res.status(404).json({ message: 'Applicant not found' });
    res.json(applicant);
  } catch (err) {
    next(err);
  }
}

export async function scheduleInterviewController(req, res, next) {
  try {
    const companyId = req.user.company_id;
    const { id } = req.params;
    const { interview_date } = req.body;
    const applicant = await scheduleInterview(companyId, id, interview_date);
    if (!applicant) return res.status(404).json({ message: 'Applicant not found' });
    res.json(applicant);
  } catch (err) {
    next(err);
  }
}

export async function offerLetterController(req, res, next) {
  try {
    const companyId = req.user.company_id;
    const { id } = req.params;
    const applicant = await getApplicantWithJob(companyId, id);
    if (!applicant) return res.status(404).json({ message: 'Applicant not found' });

    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `inline; filename="offer-letter-${applicant.id}.pdf"`
    );

    doc.pipe(res);

    doc.fontSize(20).text('Offer Letter', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Candidate: ${applicant.full_name}`);
    doc.text(`Position: ${applicant.job_title}`);
    if (applicant.location) doc.text(`Location: ${applicant.location}`);
    doc.moveDown();
    doc.text(
      'We are pleased to offer you employment with our company. This is a system-generated sample offer letter.'
    );

    doc.end();
  } catch (err) {
    next(err);
  }
}
