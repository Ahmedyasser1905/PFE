import express from 'express';
import User from '../models/User';
import crypto from 'crypto';
import sendEmail from '../utils/sendEmail';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { validateBody } from '../middleware/validate';
import {
    registerSchema,
    loginSchema,
    forgotPasswordSchema,
    verifyOtpSchema,
    resetPasswordOtpSchema,
} from '../validators/schemas';

const router = express.Router();

// ─── POST /api/auth/register ──────────────────────────────────────────────────
router.post('/register', validateBody(registerSchema), async (req, res) => {
    try {
        const { fullName, email, password } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);
        const verificationToken = crypto.randomBytes(32).toString('hex');

        const user = await User.create({
            fullName,
            email,
            passwordHash,
            verificationToken,
            isVerified: false,
        });

        const verificationUrl = `${req.protocol}://${req.get('host')}/api/auth/verify-email/${verificationToken}`;
        const message = `Welcome to BuildEst! Please verify your email by clicking the link below:\n\n${verificationUrl}`;

        await sendEmail({
            email: user.email,
            subject: 'Email Verification',
            message,
        });

        res.status(201).json({
            message: 'Registration successful. Please check your email to verify your account.',
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// ─── GET /api/auth/verify-email/:token ────────────────────────────────────────
router.get('/verify-email/:token', async (req, res) => {
    try {
        const user = await User.findOneAndUpdate(
            { verificationToken: req.params.token },
            { $set: { isVerified: true }, $unset: { verificationToken: 1 } },
            { new: true }
        );

        if (!user) {
            return res.status(400).send('<h1>Invalid or expired verification token</h1>');
        }

        res.send('<h1>Email verified successfully! You can now log in.</h1>');
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
router.post('/login', validateBody(loginSchema), async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        if (!user.isVerified) {
            return res.status(401).json({ message: 'Please verify your email before logging in' });
        }

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const secret = process.env.JWT_SECRET;
        if (!secret) {
            console.error('[Auth] CRITICAL: JWT_SECRET is not set');
            return res.status(500).json({ message: 'Server configuration error' });
        }

        const token = jwt.sign(
            { id: user._id, role: user.role },
            secret,
            { expiresIn: '7d' }
        );

        res.json({
            token,
            user: {
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
                avatar: user.avatar,
            },
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// ─── POST /api/auth/forgot-password ───────────────────────────────────────────
router.post('/forgot-password', validateBody(forgotPasswordSchema), async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            // Return success even if user not found (prevent email enumeration)
            return res.status(200).json({ message: 'If an account exists, an OTP has been sent' });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpHash = await bcrypt.hash(otp, 10);

        await User.findOneAndUpdate(
            { email },
            {
                resetOTP: otpHash,
                resetOTPExpires: new Date(Date.now() + 10 * 60 * 1000),
            }
        );

        const message = `Your password reset OTP is: ${otp}. It expires in 10 minutes.`;
        await sendEmail({
            email: user.email,
            subject: 'Password Reset OTP',
            message,
        });

        res.status(200).json({ message: 'OTP sent to email' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// ─── POST /api/auth/verify-otp ────────────────────────────────────────────────
router.post('/verify-otp', validateBody(verifyOtpSchema), async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await User.findOne({
            email,
            resetOTPExpires: { $gt: Date.now() },
        });

        if (!user || !user.resetOTP) {
            return res.status(400).json({ message: 'OTP expired or invalid' });
        }

        const isMatch = await bcrypt.compare(otp, user.resetOTP);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        res.status(200).json({ message: 'OTP verified' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// ─── POST /api/auth/reset-password-otp ────────────────────────────────────────
router.post('/reset-password-otp', validateBody(resetPasswordOtpSchema), async (req, res) => {
    try {
        const { email, otp, password } = req.body;
        const user = await User.findOne({
            email,
            resetOTPExpires: { $gt: Date.now() },
        });

        if (!user || !user.resetOTP) {
            return res.status(400).json({ message: 'OTP expired or invalid' });
        }

        const isMatch = await bcrypt.compare(otp, user.resetOTP);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        await User.findByIdAndUpdate(user._id, {
            $set: { passwordHash },
            $unset: { resetOTP: 1, resetOTPExpires: 1 },
        });

        await sendEmail({
            email: user.email,
            subject: 'Password Changed Successfully',
            message: `Hi ${user.fullName},\n\nThis is a confirmation that the password for your BuildEst account has been successfully changed.\n\nIf you did not perform this action, please contact support immediately.`,
        });

        res.status(200).json({ message: 'Password reset successful' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
