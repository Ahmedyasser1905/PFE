import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User';

dotenv.config();

const findUser = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || '');
        console.log('Connected to MongoDB');

        const email = 'seosolutions172@gmail.com';
        const user = await User.findOne({ email });

        if (user) {
            console.log('--------------------------------------------------');
            console.log('User Found:');
            console.log(`Email: ${user.email}`);
            console.log(`Is Verified: ${user.isVerified}`);
            console.log(`Verification Token: ${user.verificationToken}`);
            console.log(`Reset OTP: ${user.resetOTP}`);
            console.log('--------------------------------------------------');

            if (!user.isVerified && user.verificationToken) {
                const link = `http://192.168.1.9:5000/api/auth/verify-email/${user.verificationToken}`;
                console.log(`Verification Link: ${link}`);
            }
        } else {
            console.log('User not found');
        }

        await mongoose.connection.close();
    } catch (error) {
        console.error('Error:', error);
    }
};

findUser();
