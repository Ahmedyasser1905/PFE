import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { validateBody } from '../middleware/validate';
import { optionalAuth } from '../middleware/auth';
import { supabase } from '../config/supabase';

const router = Router();

// Zod schemas for validation
const CreateProjectSchema = z.object({
    name: z.string().min(1, 'Project name is required'),
    description: z.string().optional(),
    budget_type: z.enum(['ESTIMATED', 'FIXED']).default('ESTIMATED'),
    total_budget: z.number().nonnegative('Total budget must be non-negative').default(0),
});

// Helper for mapping Supabase responses to Mongoose-style frontend contracts
const mapToMongo = (row: any) => {
    if (!row) return null;
    const mapped = { ...row };
    if (mapped.id) {
        mapped._id = mapped.id;
        delete mapped.id;
    }
    if (mapped.created_at) mapped.createdAt = mapped.created_at;
    if (mapped.updated_at) mapped.updatedAt = mapped.updated_at;
    return mapped;
};

/**
 * GET /projects
 * Lists all active projects for the current user (if passed via JWT or header).
 */
router.get('/', optionalAuth, async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        const user_id = user ? (user._id || user.id).toString() : null;
        
        const { data: projects, error } = await supabase
            .from('projects')
            .select('*')
            .eq('user_id', user_id)
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.json({
            status: 'ok',
            data: projects.map(mapToMongo)
        });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

/**
 * POST /projects
 * Creates a new project and implicitly creates a corresponding Estimation resource.
 */
router.post('/', optionalAuth, validateBody(CreateProjectSchema), async (req: Request, res: Response) => {
    try {
        const { name, description, budget_type, total_budget } = req.body;
        const user = (req as any).user;
        const user_id = user ? (user._id || user.id).toString() : null;

        if (!user_id) return res.status(401).json({ status: 'error', message: 'Unauthorized' });

        // 1. Create a blank Estimation record
        const { data: estimation, error: estError } = await supabase
            .from('estimations')
            .insert({
                user_id,
                budget_type,
                total_budget: Number(total_budget)
            }).select().single();

        if (estError) throw estError;

        // 2. Create the Project and connect them
        const { data: project, error: projError } = await supabase
            .from('projects')
            .insert({
                name,
                description,
                user_id,
                estimation_id: estimation.id,
                total_cost: 0,
                leaf_count: 0,
                status: 'ACTIVE'
            }).select().single();

        if (projError) throw projError;

        // 3. Complete binding
        await supabase.from('estimations').update({ project_id: project.id }).eq('id', estimation.id);

        res.status(201).json({
            status: 'ok',
            data: mapToMongo(project)
        });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

/**
 * GET /projects/:id
 * Retrieves project details
 */
router.get('/:id', optionalAuth, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const user = (req as any).user;
        const user_id = user ? (user._id || user.id).toString() : null;

        const { data: project, error } = await supabase
            .from('projects')
            .select('*')
            .eq('id', id)
            .eq('user_id', user_id)
            .single();

        if (error || !project) {
            return res.status(404).json({ status: 'error', message: 'Project not found' });
        }

        res.json({
            status: 'ok',
            data: mapToMongo(project)
        });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

/**
 * GET /projects/:id/estimation
 * Retrieves the full composite estimation for a project (the leaf calculations)
 */
router.get('/:id/estimation', optionalAuth, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const user = (req as any).user;
        const user_id = user ? (user._id || user.id).toString() : null;

        const { data: project, error: projError } = await supabase
            .from('projects')
            .select('estimation_id')
            .eq('id', id)
            .eq('user_id', user_id)
            .single();

        if (projError || !project) {
            return res.status(404).json({ status: 'error', message: 'Project not found' });
        }

        // To match MongoDB format perfectly, we must fetch the leaf_calculations relation!
        const { data: estimation, error: estError } = await supabase
            .from('estimations')
            .select('*, leaf_calculations(*)')
            .eq('id', project.estimation_id)
            .single();

        let responseData = null;
        if (estimation) {
            responseData = {
                ...mapToMongo(estimation),
                leaf_calculations: (estimation.leaf_calculations || []).map(mapToMongo)
            };
        }

        res.json({
            status: 'ok',
            data: responseData
        });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

export default router;
