import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';

import apiRouter from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();

app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'hrms-backend' });
});

app.use('/api', apiRouter);

app.use(errorHandler);

export default app;
