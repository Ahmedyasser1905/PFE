import { z } from 'zod';

// ─── Auth Validators ──────────────────────────────────────────────────────────

export const registerSchema = z.object({
    fullName: z.string().min(2, 'Full name must be at least 2 characters').max(100),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters').max(128),
});

export const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
});

export const forgotPasswordSchema = z.object({
    email: z.string().email('Invalid email address'),
});

export const verifyOtpSchema = z.object({
    email: z.string().email('Invalid email address'),
    otp: z.string().length(6, 'OTP must be exactly 6 digits'),
});

export const resetPasswordOtpSchema = z.object({
    email: z.string().email('Invalid email address'),
    otp: z.string().length(6, 'OTP must be exactly 6 digits'),
    password: z.string().min(6, 'Password must be at least 6 characters').max(128),
});

// ─── Project Validators ───────────────────────────────────────────────────────

export const createProjectSchema = z.object({
    name: z.string().min(1, 'Project name is required').max(200),
    location: z.string().max(300).optional(),
    type: z.string().min(1, 'Project type is required'),
    budget: z.number().positive().optional(),
    description: z.string().max(2000).optional(),
    deadline: z.string().datetime().optional(),
});

export const updateProjectSchema = z.object({
    name: z.string().min(1).max(200).optional(),
    location: z.string().max(300).optional(),
    type: z.string().min(1).optional(),
    budget: z.number().positive().optional(),
    description: z.string().max(2000).optional(),
    status: z.enum(['Draft', 'In Progress', 'Completed', 'On Hold']).optional(),
    progress: z.number().min(0).max(100).optional(),
    deadline: z.string().datetime().optional(),
});

// ─── Calculation Validators ───────────────────────────────────────────────────

export const createCalculationSchema = z.object({
    project: z.string().min(1, 'Project ID is required'),
    category: z.string().min(1, 'Category is required'),
    subcategory: z.string().min(1, 'Subcategory is required'),
    title: z.string().min(1, 'Title is required').max(200),
    inputs: z.record(z.string(), z.any()),
    result: z.number(),
    unit: z.string().min(1, 'Unit is required'),
});

// ─── Chat Validators ─────────────────────────────────────────────────────────

export const sendChatSchema = z.object({
    message: z.string().min(1, 'Message is required').max(2000),
    sessionId: z.string().optional(),
});

// ─── Estimate Validators ──────────────────────────────────────────────────────

export const createEstimateSchema = z.object({
    project: z.string().min(1, 'Project ID is required'),
    items: z.array(z.object({
        title: z.string().min(1),
        quantity: z.number().positive(),
        unitPrice: z.number().positive(),
        unit: z.string().min(1),
    })).min(1, 'At least one item is required'),
});

// ─── User Profile Validators ──────────────────────────────────────────────────

export const updateProfileSchema = z.object({
    fullName: z.string().min(2).max(100).optional(),
    avatar: z.string().url().optional(),
});

export const changePasswordSchema = z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters').max(128),
});

// ─── Pagination ───────────────────────────────────────────────────────────────

export const paginationSchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(50).default(20),
});

// ─── ObjectId Param ───────────────────────────────────────────────────────────

export const objectIdParamSchema = z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID format'),
});
