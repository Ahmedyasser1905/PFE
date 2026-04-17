import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { validateBody } from '../middleware/validate';
import { optionalAuth } from '../middleware/auth';
import Project from '../models/Project';
import Estimation from '../models/Estimation';

const router = Router();

// Zod schemas for validation
const CreateProjectSchema = z.object({
    name: z.string().min(1, 'Project name is required'),
    description: z.string().optional(),
    budget_type: z.enum(['ESTIMATED', 'FIXED']).default('ESTIMATED'),
    total_budget: z.number().nonnegative('Total budget must be non-negative').default(0),
});

/**
 * GET /projects
 * Lists all active projects for the current user (if passed via JWT or header).
 */
router.get('/', optionalAuth, async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        const user_id = user ? user._id.toString() : null;
        
        // Find projects matching user_id
        const projects = await Project.find({ user_id, status: 'ACTIVE' }).sort({ createdAt: -1 });

        res.json({
            status: 'ok',
            data: projects
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
        const user_id = user ? user._id.toString() : null;

        // 1. Create a blank Estimation record
        const estimation = await Estimation.create({
            project_id: 'pending_project_id', // Temporal hook
            user_id,
            budget_type,
            total_budget: Number(total_budget),
            leaf_calculations: []
        });

        // 2. Create the Project and connect them
        const project = await Project.create({
            name,
            description,
            user_id,
            estimation_id: estimation._id,
            total_cost: 0,
            leaf_count: 0,
            status: 'ACTIVE'
        });

        // 3. Complete binding
        estimation.project_id = project._id as string;
        await estimation.save();

        res.status(201).json({
            status: 'ok',
            data: project
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
        const user_id = user ? user._id.toString() : null;

        const project = await Project.findOne({ _id: id, user_id });
        if (!project) {
            return res.status(404).json({ status: 'error', message: 'Project not found' });
        }

        res.json({
            status: 'ok',
            data: project
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
        const user_id = user ? user._id.toString() : null;

        const project = await Project.findOne({ _id: id, user_id });
        if (!project) {
            return res.status(404).json({ status: 'error', message: 'Project not found' });
        }

        const estimation = await Estimation.findOne({ _id: project.estimation_id });
        
        // Return a shape matching the Estimation model
        res.json({
            status: 'ok',
            data: estimation || null
        });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

export default router;
