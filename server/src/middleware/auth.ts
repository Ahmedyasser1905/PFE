import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';

export interface AuthRequest extends Request {
    user?: IUser;
}

/**
 * JWT Authentication Middleware
 * Verifies the Bearer token and attaches the user to the request.
 */
export const protect = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ status: 'error', message: 'Not authorized — no token provided' });
            return;
        }

        const token = authHeader.split(' ')[1];
        const secret = process.env.JWT_SECRET;

        if (!secret) {
            console.error('[Auth] CRITICAL: JWT_SECRET is not set in environment');
            res.status(500).json({ status: 'error', message: 'Server configuration error' });
            return;
        }

        const decoded = jwt.verify(token, secret) as { id: string; role: string };
        const user = await User.findById(decoded.id).select('-passwordHash -resetOTP -resetOTPExpires -verificationToken');

        if (!user) {
            res.status(401).json({ status: 'error', message: 'Not authorized — user not found' });
            return;
        }

        req.user = user;
        next();
    } catch (error: any) {
        if (error.name === 'TokenExpiredError') {
            res.status(401).json({ status: 'error', message: 'Token expired — please log in again' });
            return;
        }
        if (error.name === 'JsonWebTokenError') {
            res.status(401).json({ status: 'error', message: 'Invalid token' });
            return;
        }
        res.status(500).json({ status: 'error', message: 'Authentication error' });
    }
};

/**
 * Optional Authentication Middleware
 * Does not block the request if no valid token is provided, 
 * but attaches the user if there is a valid JWT or x-user-id header.
 */
export const optionalAuth = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;
        const xUserId = req.headers['x-user-id'];

        // If x-user-id is supplied, we just attach a mocked user or find if useful.
        // We'll primarily rely on JWT for actual security.
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            const secret = process.env.JWT_SECRET;
            
            if (secret) {
                const decoded = jwt.verify(token, secret) as { id: string; role: string };
                const user = await User.findById(decoded.id).select('-passwordHash');
                if (user) {
                    req.user = user;
                    return next();
                }
            }
        }

        // If x-user-id is passed but no valid JWT
        if (xUserId && typeof xUserId === 'string') {
            // we'll attempt to find it just in case
            const user = await User.findById(xUserId).select('-passwordHash');
            if (user) {
                req.user = user;
            }
        }

        next();
    } catch (error: any) {
        // Just proceed without user
        next();
    }
}

/**
 * Role-based access control middleware.
 * Usage: authorize('Admin', 'Super Admin')
 */
export const authorize = (...roles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction): void => {
        if (!req.user) {
            res.status(401).json({ status: 'error', message: 'Not authorized' });
            return;
        }
        if (!roles.includes(req.user.role)) {
            res.status(403).json({ status: 'error', message: 'Insufficient permissions' });
            return;
        }
        next();
    };
};
