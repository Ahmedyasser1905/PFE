import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface IMaterial extends Document<string> {
    _id: string;
    name: string;
    description?: string;
    unit: string;
    unit_price: number;
    waste_factor_default: number;
    category_id?: string; // Optional: Link to a specific Leaf Category if restricted
    createdAt: Date;
    updatedAt: Date;
}

const MaterialSchema: Schema = new Schema({
    _id: { type: String, default: uuidv4 }, // UUID
    name: { type: String, required: true },
    description: { type: String },
    unit: { type: String, required: true },
    unit_price: { type: Number, required: true },
    waste_factor_default: { type: Number, default: 0 },
    category_id: { type: String, index: true }
}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

MaterialSchema.virtual('material_id').get(function() {
    return this._id;
});

export default mongoose.model<IMaterial>('Material', MaterialSchema);
