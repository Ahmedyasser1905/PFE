import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User';

dotenv.config();

const clearDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || '');
        console.log('Connected to MongoDB');

        const result = await User.deleteMany({});
        console.log(`Deleted ${result.deletedCount} users.`);

        await mongoose.connection.close();
    } catch (error) {
        console.error('Error:', error);
    }
};

clearDB();
