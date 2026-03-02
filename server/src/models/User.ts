import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    fullName: string;
    email: string;
    passwordHash: string;
    role: 'Free' | 'Premium' | 'Company' | 'Admin' | 'Super Admin';
    avatar?: string;
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema: Schema = new Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: {
        type: String,
        enum: ['Free', 'Premium', 'Company', 'Admin', 'Super Admin'],
        default: 'Free'
    },
    avatar: { type: String },
}, { timestamps: true });

export default mongoose.model<IUser>('User', UserSchema);
