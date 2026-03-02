import mongoose, { Schema, Document } from 'mongoose';

export interface IProject extends Document {
    name: string;
    owner: mongoose.Types.ObjectId;
    location?: string;
    type: string;
    budget?: number;
    status: 'Draft' | 'In Progress' | 'Completed' | 'On Hold';
    progress: number;
    deadline?: Date;
    createdAt: Date;
}

const ProjectSchema: Schema = new Schema({
    name: { type: String, required: true },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    location: { type: String },
    type: { type: String, required: true },
    budget: { type: Number },
    status: {
        type: String,
        enum: ['Draft', 'In Progress', 'Completed', 'On Hold'],
        default: 'Draft'
    },
    progress: { type: Number, default: 0 },
    deadline: { type: Date },
}, { timestamps: true });

export default mongoose.model<IProject>('Project', ProjectSchema);
