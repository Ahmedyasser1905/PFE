import dotenv from 'dotenv';
import path from 'path';
import sendEmail from './src/utils/sendEmail';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '.env') });

const testEmail = async () => {
    console.log('🚀 Starting SMTP Test...');
    console.log(`Using EMAIL_USER: ${process.env.EMAIL_USER || 'Not set'}`);
    console.log(`Using EMAIL_HOST: ${process.env.EMAIL_HOST || 'smtp.ethereal.email'}`);

    try {
        await sendEmail({
            email: process.env.EMAIL_USER || 'test@example.com',
            subject: 'BuildEst SMTP Test',
            message: 'If you are reading this, your Nodemailer configuration is working correctly! 🎉',
        });
        console.log('✅ Test execution finished. Check your inbox or terminal console.');
    } catch (error: any) {
        console.error('❌ Test failed with error:', error.message);
    }
};

testEmail();
