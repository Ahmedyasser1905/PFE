import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import { protect, AuthRequest } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { updateProfileSchema, changePasswordSchema } from '../validators/schemas';

const router = express.Router();

// All user routes require authentication
router.use(protect);

// ─── GET /api/users/me — Get current user profile ────────────────────────────
router.get('/me', async (req: AuthRequest, res) => {
    try {
        const user = await User.findById(req.user!._id)
            .select('-passwordHash -resetOTP -resetOTPExpires -verificationToken')
            .lean();

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// ─── PUT /api/users/me — Update profile ───────────────────────────────────────
router.put('/me', validateBody(updateProfileSchema), async (req: AuthRequest, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.user!._id,
            { $set: req.body },
            { new: true, runValidators: true }
        ).select('-passwordHash -resetOTP -resetOTPExpires -verificationToken');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// ─── PUT /api/users/me/password — Change password ─────────────────────────────
router.put('/me/password', validateBody(changePasswordSchema), async (req: AuthRequest, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        const user = await User.findById(req.user!._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
        if (!isMatch) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(newPassword, salt);

        await User.findByIdAndUpdate(user._id, { $set: { passwordHash } });

        res.json({ message: 'Password updated successfully' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
