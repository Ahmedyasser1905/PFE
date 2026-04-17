import express from 'express';
import { supabase } from '../config/supabase';
import { protect, AuthRequest } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { updateProfileSchema, changePasswordSchema } from '../validators/schemas';

const router = express.Router();

// All user routes require authentication
router.use(protect);

// ─── GET /api/users/me — Get current user profile ────────────────────────────
router.get('/me', async (req: AuthRequest, res) => {
    try {
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', req.user!.id)
            .single();

        if (error || !profile) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            ...profile,
            _id: profile.id,
            fullName: profile.full_name
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// ─── PUT /api/users/me — Update profile ───────────────────────────────────────
router.put('/me', validateBody(updateProfileSchema), async (req: AuthRequest, res) => {
    try {
        const { fullName, avatar } = req.body;
        
        const { data: profile, error } = await supabase
            .from('profiles')
            .update({
                full_name: fullName,
                avatar: avatar
            })
            .eq('id', req.user!.id)
            .select()
            .single();

        if (error || !profile) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            ...profile,
            _id: profile.id,
            fullName: profile.full_name
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// ─── PUT /api/users/me/password — Change password ─────────────────────────────
router.put('/me/password', validateBody(changePasswordSchema), async (req: AuthRequest, res) => {
    try {
        const { newPassword } = req.body;

        const { error } = await supabase.auth.updateUser({
            password: newPassword
        });

        if (error) return res.status(400).json({ message: error.message });

        res.json({ message: 'Password updated successfully' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
