import { Request, Response, NextFunction } from 'express';

/**
 * Global error handler middleware.
 * Catches all unhandled errors and returns a consistent JSON response.
 */
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction): void => {
    console.error(`[Error] ${req.method} ${req.path}:`, err.message || err);

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map((e: any) => e.message);
        res.status(400).json({ status: 'error', message: 'Validation error', errors: messages });
        return;
    }

    // Mongoose duplicate key error
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        res.status(409).json({ status: 'error', message: `Duplicate value for field: ${field}` });
        return;
    }

    // Mongoose cast error (invalid ObjectId)
    if (err.name === 'CastError') {
        res.status(400).json({ status: 'error', message: `Invalid value for ${err.path}: ${err.value}` });
        return;
    }

    const statusCode = err.statusCode || 500;
    const message = statusCode === 500 
        ? (process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message)
        : err.message;

    res.status(statusCode).json({ status: 'error', message });
};

/**
 * 404 handler for unknown routes.
 */
export const notFoundHandler = (req: Request, res: Response): void => {
    res.status(404).json({ status: 'error', message: `Route not found: ${req.method} ${req.originalUrl}` });
};
