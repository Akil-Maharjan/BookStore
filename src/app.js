import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import 'express-async-errors';

import router from './routes/index.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import { all } from 'axios';

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: ['http://localhost:5173', 'https://bookstore-omega.vercel.app'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', env: process.env.NODE_ENV || 'development' });
});

// API routes
app.use('/api', router);

// 404 and error handlers
app.use(notFound);
app.use(errorHandler);

export default app;
