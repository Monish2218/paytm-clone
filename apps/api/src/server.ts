import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { prisma } from './db/prisma';

import authRoutes from './modules/auth/auth.routes';
import userRoutes from './modules/user/user.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT ?? 8000;
const FRONTEND_URL = process.env.FRONTEND_URL ?? 'http://localhost:3001'; 

app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,
}));
app.use(helmet());

if(process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json({limit: '10kb'}));
app.use(express.urlencoded({extended: true, limit: '10kb'}));
app.use(cookieParser());

app.get('/health', (req, res) => {
  res.status(200).json({status: 'PaySphere API service is healthy', timestamp: new Date()});
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Sorry, can't find that!" });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Unhandled API Error:", err.message, err.stack);
  const statusCode = err.statusCode ?? 500;
  const message = err.message ?? 'An unexpected internal server error occurred.';
  res.status(statusCode).json({
    message,
  });
});

const startServer = async () => {
  try {
    await prisma.$connect();
    console.log('Database connected successfully.');

    app.listen(PORT, () => {
      console.log(`PaySphere API service running on http://localhost:${PORT}`);
      console.log(`Accepting requests from frontend at: ${FRONTEND_URL}`);
    });
  } catch (error) {
    console.error('Failed to start API server or connect to the database:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
};

startServer();

const gracefulShutdown = async (signal: string) => {
  console.log(`\n${signal} signal received. Shutting down gracefully...`);
  await prisma.$disconnect();
  console.log('Prisma Client disconnected.');
  process.exit(0);
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));