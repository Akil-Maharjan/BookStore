import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import 'express-async-errors';

import router from './routes/index.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

const app = express();

// ✅ CORS middleware
app.use(cors({
  origin: 'https://book-store-eight-pied.vercel.app', // your frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Helmet (with default config, safe with CORS now)
app.use(helmet({
  crossOriginResourcePolicy: false // disable CORP to avoid blocking cross-origin requests
}));

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
