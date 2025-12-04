import fs from 'fs';
import path from 'path';
import { addDocument, listDocuments, getDocument } from './document.service.js';

export async function uploadDocumentController(req, res, next) {
  try {
    const companyId = req.user.company_id;
    const { employeeId } = req.params;
    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    const doc = await addDocument(companyId, employeeId, req.user.id, file, req.body);
    res.status(201).json(doc);
  } catch (err) {
    next(err);
  }
}

export async function listDocumentsController(req, res, next) {
  try {
    const companyId = req.user.company_id;
    const { employeeId } = req.query;
    const docs = await listDocuments(companyId, { employeeId });
    res.json(docs);
  } catch (err) {
    next(err);
  }
}

export async function downloadDocumentController(req, res, next) {
  try {
    const companyId = req.user.company_id;
    const { id } = req.params;
    const doc = await getDocument(companyId, id);
    if (!doc) return res.status(404).json({ message: 'Document not found' });

    const absPath = path.resolve(doc.file_path);
    if (!fs.existsSync(absPath)) {
      return res.status(404).json({ message: 'File not found on disk' });
    }

    res.download(absPath, doc.file_name);
  } catch (err) {
    next(err);
  }
}
