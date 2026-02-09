import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendPasswordResetEmailParams {
    email: string;
    name: string;
    resetToken: string;
}