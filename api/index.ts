import { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

// Import routes
import authRoutes from './server/src/routes/auth';
import memberRoutes from './server/src/routes/members';
import attendanceRoutes from './server/src/routes/attendance';
import eventRoutes from './server/src/routes/events';
import financialRoutes from './server/src/routes/financial';
import communicationRoutes from './server/src/routes/communications';
import volunteerRoutes from './server/src/routes/volunteers';
import pastoralCareRoutes from './server/src/routes/pastoralCare';
import inventoryRoutes from './server/src/routes/inventory';
import expenseRoutes from './server/src/routes/expenses';
import vendorRoutes from './server/src/routes/vendors';
import budgetRoutes from './server/src/routes/budget';
import reportRoutes from './server/src/routes/reports';

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/financial', financialRoutes);
app.use('/api/communications', communicationRoutes);
app.use('/api/volunteers', volunteerRoutes);
app.use('/api/pastoral-care', pastoralCareRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/budget', budgetRoutes);
app.use('/api/reports', reportRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default function handler(req: VercelRequest, res: VercelResponse) {
  return app(req, res);
}
