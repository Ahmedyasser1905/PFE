import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User';

dotenv.config();

const listUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || '');
        console.log('Connected to MongoDB');

        const users = await User.find({}, 'email isVerified verificationToken');

        console.log('--------------------------------------------------');
        console.log(`Total Users: ${users.length}`);
        users.forEach(u => {
            console.log(`- ${u.email} (Verified: ${u.isVerified}) | Token: ${u.verificationToken || 'None'}`);
        });
        console.log('--------------------------------------------------');

        await mongoose.connection.close();
    } catch (error) {
        console.error('Error:', error);
    }
};

listUsers();
