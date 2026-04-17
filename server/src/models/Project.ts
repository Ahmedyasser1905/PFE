import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface IProject extends Document<string> {
    _id: string; // Project ID (UUID)
    user_id: string | null; // Nullable for anonymous
    name: string;
    description?: string;
    status: 'ACTIVE' | 'ARCHIVED';
    estimation_id?: string;
    total_cost: number;
    leaf_count: number;
    createdAt: Date;
    updatedAt: Date;
}

const ProjectSchema: Schema = new Schema({
    _id: { type: String, default: uuidv4 },
    user_id: { type: String, default: null, index: true },
    name: { type: String, required: true },
    description: { type: String },
    status: {
        type: String,
        enum: ['ACTIVE', 'ARCHIVED'],
        default: 'ACTIVE',
    },
    estimation_id: { type: String },
    total_cost: { type: Number, default: 0 },
    leaf_count: { type: Number, default: 0 }
}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for contract mapping
ProjectSchema.virtual('project_id').get(function() {
    return this._id;
});

// Index for paginated listing
ProjectSchema.index({ user_id: 1, createdAt: -1 });

export default mongoose.model<IProject>('Project', ProjectSchema);
