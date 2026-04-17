import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { validateBody } from '../middleware/validate';
import { optionalAuth } from '../middleware/auth';
import Project from '../models/Project';
import Estimation, { ILeafCalculation } from '../models/Estimation';
import Category from '../models/Category';
import Material from '../models/Material';

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

// Mock engine computing function
async function computeLeaf(category_id: string, formula_id: string, field_values: Record<string, any>): Promise<Partial<ILeafCalculation>> {
    const category = await Category.findOne({ _id: category_id, type: 'LEAF' });
    if (!category) throw new Error('Leaf category not found');

    const formula = category.formulas.find(f => f.formula_id === formula_id);
    if (!formula) throw new Error('Formula not found on category');

    // Default mock calculation logic: multiply all numeric fields
    let total_quantity = 1;
    for (const val of Object.values(field_values)) {
        if (typeof val === 'number') total_quantity *= val;
    }

    // Mock retrieving some materials related to the leaf
    const materials = await Material.find({ category_id }).limit(3);
    const material_lines = materials.map(mat => {
        const qty = total_quantity * (1 + (mat.waste_factor_default / 100));
        return {
            material_id: mat._id as string,
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
        outputs: {
            total_quantity,
            units: 'calculated_unit'
        },
        material_lines,
        total_cost
    };
}

/**
 * POST /calculate
 * Stateless preview
 */
router.post('/calculate', optionalAuth, validateBody(CalculateSchema), async (req: Request, res: Response) => {
    try {
        const { category_id, selected_formula_id, field_values } = req.body;
        const result = await computeLeaf(category_id, selected_formula_id, field_values);

        res.json({
            status: 'ok',
            data: result
        });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

/**
 * POST /estimation/save-leaf
 */
router.post('/save-leaf', optionalAuth, validateBody(SaveLeafSchema), async (req: Request, res: Response) => {
    try {
        const { project_id, category_id, selected_formula_id, field_values } = req.body;
        const user = (req as any).user;
        const user_id = user ? user._id.toString() : null;

        const project = await Project.findOne({ _id: project_id, user_id });
        if (!project || !project.estimation_id) {
            return res.status(404).json({ status: 'error', message: 'Project or Estimation not found' });
        }

        const estimation = await Estimation.findById(project.estimation_id);
        if (!estimation) {
            return res.status(404).json({ status: 'error', message: 'Estimation record missing' });
        }

        const calculated = await computeLeaf(category_id, selected_formula_id, field_values);

        const newLeaf = {
            leaf_id: uuidv4(),
            ...calculated,
            created_at: new Date(),
            updated_at: new Date()
        } as ILeafCalculation;

        estimation.leaf_calculations.push(newLeaf);
        
        // Recalculate totals
        estimation.total_budget = estimation.leaf_calculations.reduce((sum, leaf) => sum + leaf.total_cost, 0);
        await estimation.save();

        project.total_cost = estimation.total_budget;
        project.leaf_count = estimation.leaf_calculations.length;
        await project.save();

        res.json({
            status: 'ok',
            data: estimation
        });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

/**
 * DELETE /estimation/leaf
 */
router.delete('/leaf', optionalAuth, validateBody(DeleteLeafSchema), async (req: Request, res: Response) => {
    try {
        const { project_id, leaf_id } = req.body;
        const user = (req as any).user;
        const user_id = user ? user._id.toString() : null;

        const project = await Project.findOne({ _id: project_id, user_id });
        if (!project || !project.estimation_id) {
            return res.status(404).json({ status: 'error', message: 'Project not found' });
        }

        const estimation = await Estimation.findById(project.estimation_id);
        if (!estimation) {
            return res.status(404).json({ status: 'error', message: 'Estimation not found' });
        }

        estimation.leaf_calculations = estimation.leaf_calculations.filter(leaf => leaf.leaf_id !== leaf_id);
        
        estimation.total_budget = estimation.leaf_calculations.reduce((sum, leaf) => sum + leaf.total_cost, 0);
        await estimation.save();

        project.total_cost = estimation.total_budget;
        project.leaf_count = estimation.leaf_calculations.length;
        await project.save();

        res.json({
            status: 'ok',
            data: estimation
        });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

export default router;
