"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
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
const app = (0, express_1.default)();
const prisma = new client_1.PrismaClient();
// Security middleware
// app.use(helmet()); // Temporarily disabled for debugging
app.use((0, cors_1.default)({
    origin: process.env.NODE_ENV === 'production'
        ? process.env.FRONTEND_URL
        : ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true
}));
// Rate limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);
// General middleware
app.use((0, compression_1.default)());
app.use((0, morgan_1.default)('combined'));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
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
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
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