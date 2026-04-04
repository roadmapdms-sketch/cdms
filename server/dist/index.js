"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("./loadEnv");
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const compression_1 = __importDefault(require("compression"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const client_1 = require("@prisma/client");
const auth_1 = __importDefault(require("./routes/auth"));
const members_1 = __importDefault(require("./routes/members"));
const attendance_1 = __importDefault(require("./routes/attendance"));
const financial_1 = __importDefault(require("./routes/financial"));
const events_1 = __importDefault(require("./routes/events"));
const communications_1 = __importDefault(require("./routes/communications"));
const volunteers_1 = __importDefault(require("./routes/volunteers"));
const pastoralCare_1 = __importDefault(require("./routes/pastoralCare"));
const inventory_1 = __importDefault(require("./routes/inventory"));
const expenses_1 = __importDefault(require("./routes/expenses"));
const vendors_1 = __importDefault(require("./routes/vendors"));
const budget_1 = __importDefault(require("./routes/budget"));
const reports_1 = __importDefault(require("./routes/reports"));
const roleDashboards_1 = require("./routes/roleDashboards");
const app = (0, express_1.default)();
const prisma = new client_1.PrismaClient();
// Security middleware
app.use((0, helmet_1.default)());
const devOriginOk = (origin) => /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
const productionOrigins = () => (process.env.FRONTEND_URL || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
app.use((0, cors_1.default)({
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
}));
// Rate limiting (skip probes and health)
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    skip: (req) => req.path === '/health' || req.path.startsWith('/health/'),
});
app.use(limiter);
// General middleware
app.use((0, compression_1.default)());
app.use((0, morgan_1.default)('combined'));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
// Liveness (process up) — cheap for load balancers / orchestrators
app.get('/health', (_req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});
// Readiness (database reachable)
app.get('/health/ready', async (_req, res) => {
    try {
        await prisma.$queryRaw `SELECT 1`;
        res.json({ status: 'OK', database: 'connected', timestamp: new Date().toISOString() });
    }
    catch (e) {
        res.status(503).json({
            status: 'UNAVAILABLE',
            database: 'disconnected',
            timestamp: new Date().toISOString(),
        });
    }
});
// API routes
app.use('/api/auth', auth_1.default);
app.use('/api/members', members_1.default);
app.use('/api/attendance', attendance_1.default);
app.use('/api/financial', financial_1.default);
app.use('/api/events', events_1.default);
app.use('/api/communications', communications_1.default);
app.use('/api/volunteers', volunteers_1.default);
app.use('/api/pastoral-care', pastoralCare_1.default);
app.use('/api/inventory', inventory_1.default);
app.use('/api/expenses', expenses_1.default);
app.use('/api/vendors', vendors_1.default);
app.use('/api/budget', budget_1.default);
app.use('/api/reports', reports_1.default);
app.use('/api/admin', roleDashboards_1.adminDashboardRouter);
app.use('/api/accountant', roleDashboards_1.accountantDashboardRouter);
app.use('/api/pastor', roleDashboards_1.pastorDashboardRouter);
app.use('/api/volunteer', roleDashboards_1.volunteerCoordDashboardRouter);
app.use('/api/member', roleDashboards_1.memberPortalRouter);
// Optional: serve CRA production build from the same origin (set SERVE_STATIC=true)
const clientDist = process.env.CLIENT_DIST_PATH ||
    path_1.default.resolve(__dirname, '../../client/build');
if (process.env.SERVE_STATIC === 'true') {
    if (fs_1.default.existsSync(clientDist)) {
        app.use(express_1.default.static(clientDist, { maxAge: '1h', index: false }));
        app.get('*', (req, res, next) => {
            if (req.method !== 'GET' && req.method !== 'HEAD')
                return next();
            if (req.path.startsWith('/api'))
                return next();
            if (req.path === '/health' || req.path.startsWith('/health/'))
                return next();
            res.sendFile(path_1.default.join(clientDist, 'index.html'), (err) => (err ? next(err) : undefined));
        });
    }
    else {
        console.warn(`SERVE_STATIC=true but CLIENT_DIST_PATH not found: ${clientDist}`);
    }
}
// Error handling middleware
app.use((err, req, res, next) => {
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
        server.on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                console.error(`Port ${PORT} is already in use (another server is running). Stop it or set PORT in server/.env.local.`);
                process.exit(1);
            }
            throw err;
        });
    }
    catch (error) {
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
exports.default = app;
//# sourceMappingURL=index.js.map