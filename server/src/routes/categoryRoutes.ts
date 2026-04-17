import { Router, Request, Response } from 'express';
import { supabase } from '../config/supabase';

const router = Router();

// Helper to map Supabase to Mongo-style
const mapToMongo = (row: any) => ({
    ...row,
    _id: row.id,
    createdAt: row.created_at,
    updatedAt: row.updated_at
});

// GET /categories (Returns ROOTs nested with BRANCHes)
router.get('/', async (req: Request, res: Response) => {
    try {
        const { data: roots, error: rootError } = await supabase.from('categories').select('*').eq('type', 'ROOT');
        const { data: branches, error: branchError } = await supabase.from('categories').select('*').eq('type', 'BRANCH');

        if (rootError || branchError) throw (rootError || branchError);

        const data = (roots || []).map(root => ({
            ...mapToMongo(root),
            children: (branches || [])
                .filter(b => b.parent_id === root.id)
                .map(mapToMongo)
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
        const { data: leaves, error } = await supabase
            .from('categories')
            .select('*')
            .eq('parent_id', id)
            .eq('type', 'LEAF');

        if (error) throw error;

        res.json({
            status: 'ok',
            data: (leaves || []).map(mapToMongo)
        });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// GET /categories/:id/leaf
router.get('/:id/leaf', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { data: leaf, error } = await supabase
            .from('categories')
            .select('*')
            .eq('id', id)
            .eq('type', 'LEAF')
            .single();

        if (error || !leaf) {
            return res.status(404).json({ status: 'error', message: 'Category not found' });
        }

        res.json({
            status: 'ok',
            data: mapToMongo(leaf)
        });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

export default router;
