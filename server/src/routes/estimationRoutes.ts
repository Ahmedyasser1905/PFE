import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { validateBody } from '../middleware/validate';
import { optionalAuth } from '../middleware/auth';
import { supabase } from '../config/supabase';

const router = Router();

const CalculateSchema = z.object({
    category_id: z.string().min(1),
    selected_formula_id: z.string().min(1),
    field_values: z.record(z.string(), z.any())
});

const SaveLeafSchema = z.object({
    project_id: z.string().min(1),
    category_id: z.string().min(1),
    selected_formula_id: z.string().min(1),
    field_values: z.record(z.string(), z.any())
});

const DeleteLeafSchema = z.object({
    project_id: z.string().min(1),
    leaf_id: z.string().min(1)
});

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

const mapLeaf = (leaf: any) => {
    const m = mapToMongo(leaf);
    if (m) m.leaf_id = m._id;
    return m;
};

// Supabase-driven calculation
async function computeLeaf(category_id: string, formula_id: string, field_values: Record<string, any>) {
    const { data: category, error: catError } = await supabase
        .from('categories')
        .select('*')
        .eq('id', category_id)
        .eq('type', 'LEAF')
        .single();
        
    if (catError || !category) throw new Error('Leaf category not found');

    const formulas = category.formulas || [];
    const formula = formulas.find((f: any) => f.formula_id === formula_id);
    if (!formula) throw new Error('Formula not found on category');

    let total_quantity = 1;
    for (const val of Object.values(field_values)) {
        if (typeof val === 'number') total_quantity *= val;
    }

    const { data: materials, error: matError } = await supabase
        .from('materials')
        .select('*')
        .eq('category_id', category_id)
        .limit(3);

    const material_lines = (materials || []).map(mat => {
        const qty = total_quantity * (1 + (mat.waste_factor_default / 100));
        return {
            material_id: mat.id,
            quantity: qty,
            unit_price: mat.unit_price,
            total_cost: qty * mat.unit_price,
            waste_factor: mat.waste_factor_default
        };
    });

    const total_cost = material_lines.reduce((sum, line) => sum + line.total_cost, 0);

    return {
        category_id,
        formula_id,
        inputs: field_values,
        outputs: { total_quantity, units: 'calculated_unit' },
        material_lines,
        total_cost
    };
}

/**
 * POST /calculate
 */
router.post('/calculate', optionalAuth, validateBody(CalculateSchema), async (req: Request, res: Response) => {
    try {
        const { category_id, selected_formula_id, field_values } = req.body;
        const result = await computeLeaf(category_id, selected_formula_id, field_values);

        res.json({ status: 'ok', data: result });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

/**
 * POST /save-leaf
 */
router.post('/save-leaf', optionalAuth, validateBody(SaveLeafSchema), async (req: Request, res: Response) => {
    try {
        const { project_id, category_id, selected_formula_id, field_values } = req.body;
        const user = (req as any).user;
        const user_id = user ? (user._id || user.id).toString() : null;

        const { data: project } = await supabase.from('projects').select('estimation_id').eq('id', project_id).eq('user_id', user_id).single();
        if (!project) return res.status(404).json({ status: 'error', message: 'Project not found' });

        const calculated = await computeLeaf(category_id, selected_formula_id, field_values);

        // Insert new leaf calculation relationally
        const { data: newLeaf, error: leafError } = await supabase.from('leaf_calculations').insert({
            estimation_id: project.estimation_id,
            ...calculated
        }).select().single();

        if (leafError) throw leafError;

        // Recalculate totals via aggregating the DB
        const { data: leaves } = await supabase.from('leaf_calculations').select('total_cost').eq('estimation_id', project.estimation_id);
        const newTotal = (leaves || []).reduce((sum, l) => sum + Number(l.total_cost), 0);
        const newCount = leaves ? leaves.length : 0;

        await supabase.from('estimations').update({ total_budget: newTotal }).eq('id', project.estimation_id);
        await supabase.from('projects').update({ total_cost: newTotal, leaf_count: newCount }).eq('id', project_id);

        // Fetch fully hydrated estimation to return to frontend
        const { data: estimation } = await supabase.from('estimations').select('*, leaf_calculations(*)').eq('id', project.estimation_id).single();
        
        const responseData = estimation ? {
            ...mapToMongo(estimation),
            leaf_calculations: (estimation.leaf_calculations || []).map(mapLeaf)
        } : null;

        res.json({ status: 'ok', data: responseData });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

/**
 * DELETE /leaf
 */
router.delete('/leaf', optionalAuth, validateBody(DeleteLeafSchema), async (req: Request, res: Response) => {
    try {
        const { project_id, leaf_id } = req.body;
        const user = (req as any).user;
        const user_id = user ? (user._id || user.id).toString() : null;

        const { data: project } = await supabase.from('projects').select('estimation_id').eq('id', project_id).eq('user_id', user_id).single();
        if (!project) return res.status(404).json({ status: 'error', message: 'Project not found' });

        await supabase.from('leaf_calculations').delete().eq('id', leaf_id).eq('estimation_id', project.estimation_id);

        const { data: leaves } = await supabase.from('leaf_calculations').select('total_cost').eq('estimation_id', project.estimation_id);
        const newTotal = (leaves || []).reduce((sum, l) => sum + Number(l.total_cost), 0);
        const newCount = leaves ? leaves.length : 0;

        await supabase.from('estimations').update({ total_budget: newTotal }).eq('id', project.estimation_id);
        await supabase.from('projects').update({ total_cost: newTotal, leaf_count: newCount }).eq('id', project_id);

        const { data: estimation } = await supabase.from('estimations').select('*, leaf_calculations(*)').eq('id', project.estimation_id).single();
        
        const responseData = estimation ? {
            ...mapToMongo(estimation),
            leaf_calculations: (estimation.leaf_calculations || []).map(mapLeaf)
        } : null;

        res.json({ status: 'ok', data: responseData });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

export default router;
