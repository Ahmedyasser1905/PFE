import mongoose, { Schema, Document } from 'mongoose';

export interface IChatMessage extends Document {
    userId: mongoose.Types.ObjectId;
    role: 'user' | 'assistant';
    content: string;
    sessionId: string;
    createdAt: Date;
}

const ChatMessageSchema: Schema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true },
    sessionId: { type: String, required: true, index: true },
}, { timestamps: true });

// Index for efficient session-based message retrieval
ChatMessageSchema.index({ userId: 1, sessionId: 1, createdAt: 1 });

export default mongoose.model<IChatMessage>('ChatMessage', ChatMessageSchema);
