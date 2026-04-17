import mongoose, { Schema, Document } from 'mongoose';
export interface IArticle extends Document {
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    category: string;
    image?: string;
    author: mongoose.Types.ObjectId;
    status: 'Draft' | 'Published';
    createdAt: Date;
}
const ArticleSchema: Schema = new Schema({
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    excerpt: { type: String, required: true },
    content: { type: String, required: true },
    category: { type: String, required: true },
    image: { type: String },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
        type: String,
        enum: ['Draft', 'Published'],
        default: 'Published'
    },
}, { timestamps: true });
export default mongoose.model<IArticle>('Article', ArticleSchema);
