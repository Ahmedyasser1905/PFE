import nodemailer from 'nodemailer';
interface EmailOptions {
    email: string;
    subject: string;
    message: string;
}
const sendEmail = async (options: EmailOptions) => {
    const isDev = process.env.NODE_ENV === 'development';
    const hasCredentials = process.env.EMAIL_USER && process.env.EMAIL_PASS;
    if (isDev && !hasCredentials) {
        console.log('--------------------------------------------------');
        console.log('📧 DEVELOPMENT EMAIL LOG (Missing SMTP Credentials):');
        console.log('To send real emails, please set EMAIL_USER and EMAIL_PASS in your .env file.');
        console.log(`To: ${options.email}`);
        console.log(`Subject: ${options.subject}`);
        console.log(`Message: ${options.message}`);
        console.log('--------------------------------------------------');
        return;
    }
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.ethereal.email',
        port: Number(process.env.EMAIL_PORT) || 587,
        secure: process.env.EMAIL_SECURE === 'true', 
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
        tls: {
            rejectUnauthorized: process.env.EMAIL_REJECT_UNAUTHORIZED !== 'false'
        }
    });
    try {
        const mailOptions = {
            from: `BuildEst <${process.env.EMAIL_FROM || 'noreply@buildest.com'}>`,
            to: options.email,
            subject: options.subject,
            text: options.message,
        };
        await transporter.sendMail(mailOptions);
    } catch (error) {
        if (isDev) {
            console.error('❌ SMTP Error, falling back to console log:');
            console.log('--------------------------------------------------');
            console.log(`To: ${options.email}`);
            console.log(`Subject: ${options.subject}`);
            console.log(`Message: ${options.message}`);
            console.log('--------------------------------------------------');
        } else {
            throw error;
        }
    }
};
export default sendEmail;
