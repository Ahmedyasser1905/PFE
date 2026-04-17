import express from 'express';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabase';
import { validateBody } from '../middleware/validate';
import {
    registerSchema,
    loginSchema,
    forgotPasswordSchema,
    verifyOtpSchema,
    resetPasswordOtpSchema,
} from '../validators/schemas';

const router = express.Router();

// Helper to map Supabase user/profile to Mongo-style
const mapToUser = (profile: any, email: string) => ({
    _id: profile.id,
    fullName: profile.full_name,
    email: email,
    role: profile.role,
    avatar: profile.avatar
});

// ─── POST /api/auth/register ──────────────────────────────────────────────────
router.post('/register', validateBody(registerSchema), async (req, res) => {
    try {
        const { fullName, email, password } = req.body;

        // 1. Sign up user in Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
        });

        if (authError) return res.status(400).json({ message: authError.message });
        if (!authData.user) return res.status(500).json({ message: 'User creation failed' });

        // 2. Create profile entry (Supabase might do this via triggers, but we'll do it explicitly for safety)
        const { error: profileError } = await supabase.from('profiles').upsert({
            id: authData.user.id,
            full_name: fullName,
            role: 'USER'
        });

        if (profileError) throw profileError;

        res.status(201).json({
            message: 'Registration successful. Please check your email to verify your account.',
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
router.post('/login', validateBody(loginSchema), async (req, res) => {
    try {
        const { email, password } = req.body;

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) return res.status(401).json({ message: 'Invalid email or password' });
        if (!data.user) return res.status(401).json({ message: 'Login failed' });

        const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.user.id).single();

        const secret = process.env.JWT_SECRET;
        if (!secret) throw new Error('JWT_SECRET missing');

        const token = jwt.sign(
            { id: data.user.id, role: profile?.role || 'USER' },
            secret,
            { expiresIn: '7d' }
        );

        res.json({
            token,
            user: mapToUser(profile, data.user.email!)
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// ─── POST /api/auth/forgot-password ───────────────────────────────────────────
router.post('/forgot-password', validateBody(forgotPasswordSchema), async (req, res) => {
    try {
        const { email } = req.body;
        const { error } = await supabase.auth.resetPasswordForEmail(email);

        if (error) return res.status(500).json({ message: error.message });

        res.status(200).json({ message: 'If an account exists, a reset link has been sent' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// Note: verify-otp and reset-password-otp are handled by Supabase natively via URL fragments in the app, 
// but we'll keep these endpoints as stubs or refactor them to use Supabase if the app expects them.
router.post('/verify-otp', (req, res) => {
    res.status(200).json({ message: 'Please use the Supabase reset link sent to your email.' });
});

router.post('/reset-password-otp', (req, res) => {
    res.status(200).json({ message: 'Please use the Supabase reset link sent to your email.' });
});

export default router;
