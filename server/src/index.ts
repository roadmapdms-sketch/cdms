import './loadEnv';
import express from 'express';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { PrismaClient } from '@prisma/client';

import authRoutes from './routes/auth';
import memberRoutes from './routes/members';
import attendanceRoutes from './routes/attendance';
import financialRoutes from './routes/financial';
import eventRoutes from './routes/events';
import communicationRoutes from './routes/communications';
import volunteerRoutes from './routes/volunteers';
import pastoralCareRoutes from './routes/pastoralCare';
import inventoryRoutes from './routes/inventory';
import expenseRoutes from './routes/expenses';
import vendorRoutes from './routes/vendors';
import budgetRoutes from './routes/budget';
import reportRoutes from './routes/reports';
import {
  adminDashboardRouter,
  accountantDashboardRouter,
  pastorDashboardRouter,
  volunteerCoordDashboardRouter,
  memberPortalRouter,
} from './routes/roleDashboards';

const app = express();
const prisma = new PrismaClient();

// Security middleware
app.use(helmet());

const devOriginOk = (origin: string) =>
  /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);

const productionOrigins = () =>
  (process.env.FRONTEND_URL || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }
      if (process.env.NODE_ENV !== 'production' && devOriginOk(origin)) {
        callback(null, true);
        return;
      }
      const list = productionOrigins();
      if (list.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(null, false);
    },
    credentials: true,
  })
);

// Rate limiting (skip probes and health)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  skip: (req) => req.path === '/health' || req.path.startsWith('/health/'),
});
app.use(limiter);

// General middleware
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Liveness (process up) — cheap for load balancers / orchestrators
app.get('/health', (_req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Readiness (database reachable)
app.get('/health/ready', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'OK', database: 'connected', timestamp: new Date().toISOString() });
  } catch (e) {
    res.status(503).json({
      status: 'UNAVAILABLE',
      database: 'disconnected',
      timestamp: new Date().toISOString(),
    });
  }
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/financial', financialRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/communications', communicationRoutes);
app.use('/api/volunteers', volunteerRoutes);
app.use('/api/pastoral-care', pastoralCareRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/budget', budgetRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/admin', adminDashboardRouter);
app.use('/api/accountant', accountantDashboardRouter);
app.use('/api/pastor', pastorDashboardRouter);
app.use('/api/volunteer', volunteerCoordDashboardRouter);
app.use('/api/member', memberPortalRouter);

// Optional: serve CRA production build from the same origin (set SERVE_STATIC=true)
const clientDist =
  process.env.CLIENT_DIST_PATH ||
  path.resolve(__dirname, '../../client/build');
if (process.env.SERVE_STATIC === 'true') {
  if (fs.existsSync(clientDist)) {
    app.use(express.static(clientDist, { maxAge: '1h', index: false }));
    app.get('*', (req, res, next) => {
      if (req.method !== 'GET' && req.method !== 'HEAD') return next();
      if (req.path.startsWith('/api')) return next();
      if (req.path === '/health' || req.path.startsWith('/health/')) return next();
      res.sendFile(path.join(clientDist, 'index.html'), (err) => (err ? next(err) : undefined));
    });
  } else {
    console.warn(`SERVE_STATIC=true but CLIENT_DIST_PATH not found: ${clientDist}`);
  }
}

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: { message: 'Route not found' } });
});

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');

    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
    server.on('error', (err: NodeJS.ErrnoException) => {
      if (err.code === 'EADDRINUSE') {
        console.error(
          `Port ${PORT} is already in use (another server is running). Stop it or set PORT in server/.env.local.`
        );
        process.exit(1);
      }
      throw err;
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});

startServer();

export default app;
