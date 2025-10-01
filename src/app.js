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
app.use((req, res, next) => {
  // ✅ Allow cross-origin frontend
  res.setHeader("Access-Control-Allow-Origin", "https://book-store-eight-pied.vercel.app");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  
  next();
});
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
