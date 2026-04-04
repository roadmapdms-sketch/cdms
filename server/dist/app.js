"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
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
exports.prisma = new client_1.PrismaClient();
// Vercel / proxies (rate limit, secure cookies)
app.set('trust proxy', 1);
app.use((0, helmet_1.default)());
const devOriginOk = (origin) => /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
const productionOrigins = () => {
    const list = (process.env.FRONTEND_URL || '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    if (process.env.VERCEL === '1' && process.env.VERCEL_URL) {
        list.push(`https://${process.env.VERCEL_URL}`);
    }
    return list;
};
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
const healthSkip = (path) => path === '/health' ||
    path.startsWith('/health/') ||
    path === '/api/health' ||
    path.startsWith('/api/health/');
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 100,
    skip: (req) => healthSkip(req.path),
});
app.use(limiter);
app.use((0, compression_1.default)());
app.use((0, morgan_1.default)('combined'));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
const liveness = (_req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
};
app.get('/health', liveness);
app.get('/api/health', liveness);
app.get('/health/ready', async (_req, res) => {
    try {
        await exports.prisma.$queryRaw `SELECT 1`;
        res.json({ status: 'OK', database: 'connected', timestamp: new Date().toISOString() });
    }
    catch {
        res.status(503).json({
            status: 'UNAVAILABLE',
            database: 'disconnected',
            timestamp: new Date().toISOString(),
        });
    }
});
app.get('/api/health/ready', async (_req, res) => {
    try {
        await exports.prisma.$queryRaw `SELECT 1`;
        res.json({ status: 'OK', database: 'connected', timestamp: new Date().toISOString() });
    }
    catch {
        res.status(503).json({
            status: 'UNAVAILABLE',
            database: 'disconnected',
            timestamp: new Date().toISOString(),
        });
    }
});
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
            if (healthSkip(req.path))
                return next();
            res.sendFile(path_1.default.join(clientDist, 'index.html'), (err) => (err ? next(err) : undefined));
        });
    }
    else {
        console.warn(`SERVE_STATIC=true but CLIENT_DIST_PATH not found: ${clientDist}`);
    }
}
app.use((err, _req, res, _next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        error: {
            message: err.message || 'Internal Server Error',
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
        },
    });
});
app.use('*', (req, res) => {
    res.status(404).json({ error: { message: 'Route not found' } });
});
exports.default = app;
//# sourceMappingURL=app.js.map