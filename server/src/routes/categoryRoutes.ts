import { Router, Request, Response } from 'express';
import Category from '../models/Category';

const router = Router();

// GET /categories (Returns ROOTs nested with BRANCHes)
router.get('/', async (req: Request, res: Response) => {
    try {
        const roots = await Category.find({ type: 'ROOT' }).lean();
        const branches = await Category.find({ type: 'BRANCH' }).lean();

        const data = roots.map(root => ({
            ...root,
            children: branches.filter(b => b.parent_id === root._id)
        }));

        res.json({
            status: 'ok',
            data
        });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// GET /categories/:id/children (Returns LEAFs for a BRANCH)
router.get('/:id/children', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const leaves = await Category.find({ parent_id: id, type: 'LEAF' }).lean();

        res.json({
            status: 'ok',
            data: leaves
        });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// GET /categories/:id/leaf
router.get('/:id/leaf', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const leaf = await Category.findOne({ _id: id, type: 'LEAF' }).lean();

        if (!leaf) {
            return res.status(404).json({ status: 'error', message: 'Category not found' });
        }

        res.json({
            status: 'ok',
            data: leaf
        });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

export default router;
