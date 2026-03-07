import express from 'express';
import User from '../models/User';
import crypto from 'crypto';
import sendEmail from '../utils/sendEmail';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Register User
router.post('/register', async (req, res) => {
    try {
        const { fullName, email, password } = req.body;

        // Check if user exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Generate verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');

        const user = await User.create({
            fullName,
            email,
            passwordHash,
            verificationToken,
            isVerified: false,
        });

        // Send verification email
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

// Verify Email
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

// Login User
router.post('/login', async (req, res) => {
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

        // Create JWT
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '7d' }
        );

        res.json({
            token,
            user: {
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
            }
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// Forgot Password (OTP)
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpHash = await bcrypt.hash(otp, 10);

        await User.findOneAndUpdate(
            { email },
            {
                resetOTP: otpHash,
                resetOTPExpires: new Date(Date.now() + 10 * 60 * 1000) // 10 mins
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

// Verify OTP
router.post('/verify-otp', async (req, res) => {
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

// Reset Password with OTP
router.post('/reset-password-otp', async (req, res) => {
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

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        await User.findByIdAndUpdate(user._id, {
            $set: { passwordHash },
            $unset: { resetOTP: 1, resetOTPExpires: 1 }
        });

        // Send confirmation email
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
