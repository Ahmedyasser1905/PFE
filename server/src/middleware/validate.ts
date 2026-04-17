import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

/**
 * Generic Zod validation middleware factory.
 * Validates req.body against the provided schema.
 */
export const validateBody = (schema: ZodSchema) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        try {
            req.body = schema.parse(req.body);
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const errors = (error as any).issues?.map((e: any) => ({
                    field: e.path?.join('.') || '',
                    message: e.message,
                })) || [{ field: '', message: error.message }];
                res.status(400).json({
                    status: 'error',
                    message: 'Validation failed',
                    errors,
                });
                return;
            }
            next(error);
        }
    };
};

/**
 * Validates req.params against the provided schema.
 */
export const validateParams = (schema: ZodSchema) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        try {
            const parsed = schema.parse(req.params);
            req.params = parsed as any;
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                res.status(400).json({
                    status: 'error',
                    message: 'Invalid parameters',
                    errors: (error as any).issues?.map((e: any) => ({
                        field: e.path?.join('.') || '',
                        message: e.message,
                    })) || [],
                });
                return;
            }
            next(error);
        }
    };
};

/**
 * Validates req.query against the provided schema.
 */
export const validateQuery = (schema: ZodSchema) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        try {
            const parsed = schema.parse(req.query);
            req.query = parsed as any;
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                res.status(400).json({
                    status: 'error',
                    message: 'Invalid query parameters',
                    errors: (error as any).issues?.map((e: any) => ({
                        field: e.path?.join('.') || '',
                        message: e.message,
                    })) || [],
                });
                return;
            }
            next(error);
        }
    };
};
