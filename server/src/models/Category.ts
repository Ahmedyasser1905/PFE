import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface ICategoryConfig {
    requires_volume: boolean;
    requires_area: boolean;
    requires_length: boolean;
    dependencies: string[];
}

export interface IFormulaField {
    name: string;
    type: string;
    unit: string;
    description: string;
    required: boolean;
}

export interface IFormula {
    formula_id: string;
    name: string;
    type: string;
    description: string;
    fields: IFormulaField[];
}

export interface ICategory extends Document<string> {
    _id: string;
    name: string;
    type: 'ROOT' | 'BRANCH' | 'LEAF';
    parent_id: string | null;
    icon?: string;
    description?: string;
    config?: ICategoryConfig;
    formulas: IFormula[];
    createdAt: Date;
    updatedAt: Date;
}

const FormulaFieldSchema = new Schema({
    name: { type: String, required: true },
    type: { type: String, required: true },
    unit: { type: String },
    description: { type: String },
    required: { type: Boolean, default: true }
}, { _id: false });

const FormulaSchema = new Schema({
    formula_id: { type: String, default: uuidv4, required: true },
    name: { type: String, required: true },
    type: { type: String, required: true },
    description: { type: String },
    fields: [FormulaFieldSchema]
}, { _id: false });

const CategoryConfigSchema = new Schema({
    requires_volume: { type: Boolean, default: false },
    requires_area: { type: Boolean, default: false },
    requires_length: { type: Boolean, default: false },
    dependencies: [{ type: String }]
}, { _id: false });

const CategorySchema: Schema = new Schema({
    _id: { type: String, default: uuidv4 }, // Using UUID natively
    name: { type: String, required: true },
    type: { 
        type: String, 
        enum: ['ROOT', 'BRANCH', 'LEAF'], 
        required: true 
    },
    parent_id: { type: String, default: null, index: true },
    icon: { type: String },
    description: { type: String },
    config: { type: CategoryConfigSchema },
    formulas: [FormulaSchema]
}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// To match API payload, we will map _id to category_id in the controllers, but we can also use virtuals
CategorySchema.virtual('category_id').get(function() {
    return this._id;
});

export default mongoose.model<ICategory>('Category', CategorySchema);
