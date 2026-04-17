import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import connectDB from './config/db';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

// Route imports
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import chatRoutes from './routes/chatRoutes';

// Estimation API Contract Imports
import healthRoutes from './routes/healthRoutes';
import categoryRoutes from './routes/categoryRoutes';
import projectRoutes from './routes/projectRoutes';
import estimationRoutes from './routes/estimationRoutes';

const app = express();

// ─── Global Middleware ────────────────────────────────────────────────────────

// Request Logging Middleware (Production Ready)
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// CORS — restrict origins in production
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['*'];
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? allowedOrigins 
        : '*',
    credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20,
    message: { status: 'error', message: 'Too many auth requests, please try again later' },
    standardHeaders: true,
    legacyHeaders: false,
});

const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    message: { status: 'error', message: 'Too many requests, please try again later' },
    standardHeaders: true,
    legacyHeaders: false,
});

app.use('/api/', globalLimiter);
app.use('/api/auth', authLimiter);

// ─── Core Application Routes ──────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chat', chatRoutes);

// ─── Estimation Module Routes (API Contract) ─────────────────────────────────
// Base URL: /api/estimation
app.use('/api/estimation', healthRoutes); // GET /api/estimation/health
app.use('/api/estimation/categories', categoryRoutes); // GET /api/estimation/categories
app.use('/api/estimation/projects', projectRoutes); // GET/POST /api/estimation/projects
app.use('/api/estimation', estimationRoutes); // POST /api/estimation/calculate, POST /api/estimation/save-leaf

// ─── Error Handling ───────────────────────────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
    app.listen(Number(PORT), '0.0.0.0', () => {
        console.log(`\n✅ BuildEst API running externally on port ${PORT}`);
        console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`   Estimation Endpoints Base: /api/estimation\n`);
    });
}).catch((err) => {
    console.error('❌ Failed to connect to database:', err.message);
    process.exit(1);
});

export default app;
