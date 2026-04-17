import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface IMaterialLine {
    material_id: string;
    quantity: number;
    unit_price: number;
    total_cost: number;
    waste_factor: number;
}

export interface ILeafOutput {
    total_quantity: number;
    units: string;
}

export interface ILeafCalculation {
    leaf_id: string;
    category_id: string;
    formula_id: string;
    inputs: Record<string, any>;
    outputs: ILeafOutput;
    material_lines: IMaterialLine[];
    total_cost: number;
    created_at: Date;
    updated_at: Date;
}

export interface IEstimation extends Document<string> {
    _id: string;
    project_id: string; // references Project._id
    user_id: string | null;
    total_budget: number;
    budget_type: string;
    leaf_calculations: ILeafCalculation[];
    createdAt: Date;
    updatedAt: Date;
}

const MaterialLineSchema = new Schema({
    material_id: { type: String, required: true },
    quantity: { type: Number, required: true },
    unit_price: { type: Number, required: true },
    total_cost: { type: Number, required: true },
    waste_factor: { type: Number, default: 0 }
}, { _id: false });

const LeafOutputSchema = new Schema({
    total_quantity: { type: Number, required: true },
    units: { type: String, required: true }
}, { _id: false });

const LeafCalculationSchema = new Schema({
    leaf_id: { type: String, default: uuidv4, required: true },
    category_id: { type: String, required: true, index: true },
    formula_id: { type: String, required: true },
    inputs: { type: Schema.Types.Mixed, required: true },
    outputs: { type: LeafOutputSchema, required: true },
    material_lines: [MaterialLineSchema],
    total_cost: { type: Number, required: true, default: 0 }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

const EstimationSchema: Schema = new Schema({
    _id: { type: String, default: uuidv4 }, // Using UUID
    project_id: { type: String, required: true, index: true }, // we check Project strings here
    user_id: { type: String, default: null, index: true },
    total_budget: { type: Number, default: 0 },
    budget_type: { type: String, default: 'ESTIMATED' },
    leaf_calculations: [LeafCalculationSchema]
}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Map _id to estimation_id
EstimationSchema.virtual('estimation_id').get(function() {
    return this._id;
});

export default mongoose.model<IEstimation>('Estimation', EstimationSchema);
