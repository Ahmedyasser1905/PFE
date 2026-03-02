import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
    try {
        const uri = process.env.MONGODB_URI;
        if (!uri || uri.includes('<username>')) {
            throw new Error('MONGODB_URI is missing or contains placeholders in .env file');
        }
        const conn = await mongoose.connect(uri);
        console.log(`🚀 MongoDB Connected: ${conn.connection.host}`);
    } catch (error: any) {
        console.error(`❌ Database Error: ${error.message}`);
        // We don't exit(1) so the server stays up to report errors to the frontend
    }
};

export default connectDB;
