import nodemailer from 'nodemailer';

const EMAIL_HOST = process.env.EMAIL_HOST || 'smtp.gmail.com';
const EMAIL_PORT = parseInt(process.env.EMAIL_PORT || '587');
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;

if (!EMAIL_USER || !EMAIL_PASSWORD) {
    console.error('❌ Missing email configuration!');
    console.error('EMAIL_USER:', EMAIL_USER ? '✅ Set' : '❌ Missing');
    console.error('EMAIL_PASSWORD:', EMAIL_PASSWORD ? '✅ Set' : '❌ Missing');
    throw new Error('Email configuration is incomplete. Check your .env file.');
}

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
    // For development: log to console instead of sending
    ...(process.env.NODE_ENV === 'development' && {
        streamTransport: false, // Set to true to test without sending
    }),
});

transporter.verify((error) => {
    if (error) {
        console.error('❌ Email configuration error:', error);
    } else {
        console.log('✅ Email server is ready to send messages');
    }
});

interface SendPasswordResetEmailParams {
    email: string;
    name: string;
    resetToken: string;
}

export async function sendPasswordResetEmail({
    email,
    name,
    resetToken,
}: SendPasswordResetEmailParams) {
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;
    try {
        const info = await transporter.sendMail({
            from: process.env.EMAIL_FROM || '"JAYABIMA POS" <noreply@jayabima.com>',
            to: email,
            subject: 'Reset Your Password - JAYABIMA POS',
            html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Reset Your Password</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #f4f4f4; padding: 20px; border-radius: 10px;">
              <h1 style="color: #2563eb; margin-bottom: 20px;">Reset Your Password</h1>
              
              <p>Hi ${name},</p>
              
              <p>We received a request to reset your password for your JAYABIMA POS account.</p>
              
              <p>Click the button below to reset your password:</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" 
                   style="background-color: #2563eb; 
                          color: white; 
                          padding: 12px 30px; 
                          text-decoration: none; 
                          border-radius: 5px; 
                          display: inline-block;
                          font-weight: bold;">
                  Reset Password
                </a>
              </div>
              
              <p>Or copy and paste this link into your browser:</p>
              <p style="background-color: #fff; padding: 10px; border-radius: 5px; word-break: break-all;">
                ${resetUrl}
              </p>
              
              <p><strong>This link will expire in 1 hour.</strong></p>
              
              <p>If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
              
              <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
              
              <p style="font-size: 12px; color: #666;">
                This is an automated email from JAYABIMA POS. Please do not reply to this email.
              </p>
            </div>
          </body>
        </html>
      `,
            // Plain text version for email clients that don't support HTML
            text: `
                Hi ${name},

                We received a request to reset your password for your JAYABIMA POS account.

                Click the link below to reset your password:
                ${resetUrl}

                This link will expire in 1 hour.

                If you didn't request a password reset, please ignore this email.

                Best regards,
                JAYABIMA POS Team
              `,
        });
        console.log('✅ Password reset email sent successfully');
        console.log('📧 Message ID:', info.messageId);
        console.log('📬 Sent to:', email);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Email sending failed:', error);
        return { success: false, error };
    }
}

export async function sendWelcomeEmail(email: string, name: string) {
    try {
        const info = await transporter.sendMail({
            from: process.env.EMAIL_FROM || '"JAYABIMA POS" <noreply@jayabima.com>',
            to: email,
            subject: 'Welcome to JAYABIMA POS!',
            html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #f4f4f4; padding: 20px; border-radius: 10px;">
              <h1 style="color: #2563eb;">Welcome to JAYABIMA POS!</h1>
              
              <p>Hi ${name},</p>
              
              <p>Thank you for joining JAYABIMA POS. Your account has been successfully created!</p>
              
              <p>You can now access all features of our Point of Sale system:</p>
              
              <ul style="line-height: 1.8;">
                <li>✅ Manage Inventory</li>
                <li>✅ Process Sales</li>
                <li>✅ Track Customers</li>
                <li>✅ Generate Reports</li>
              </ul>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/login" 
                   style="background-color: #2563eb; 
                          color: white; 
                          padding: 12px 30px; 
                          text-decoration: none; 
                          border-radius: 5px; 
                          display: inline-block;
                          font-weight: bold;">
                  Login to Your Account
                </a>
              </div>
              
              <p>If you have any questions, feel free to contact our support team.</p>
              
              <p>Best regards,<br>The JAYABIMA POS Team</p>
              
              <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
              
              <p style="font-size: 12px; color: #666;">
                This is an automated email from JAYABIMA POS.
              </p>
            </div>
          </body>
        </html>
      `,
            text: `
Hi ${name},

Welcome to JAYABIMA POS! Your account has been successfully created.

You can now access all features:
- Manage Inventory
- Process Sales
- Track Customers
- Generate Reports

Login at: ${process.env.NEXT_PUBLIC_APP_URL}/login

Best regards,
JAYABIMA POS Team
      `,
        });
        console.log('✅ Welcome email sent successfully');
        console.log('📧 Message ID:', info.messageId);
        console.log('📬 Sent to:', email);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Welcome email sending failed:', error);
        return { success: false, error };
    }
}

export async function testEmailConfiguration() {
    try {
        const info = await transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to: process.env.EMAIL_USER, // Send to yourself
            subject: 'JAYABIMA POS - Email Configuration Test',
            html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h1 style="color: #2563eb;">✅ Email Configuration Test</h1>
          <p>If you received this email, your email configuration is working correctly!</p>
          <hr>
          <p><strong>Configuration Details:</strong></p>
          <ul>
            <li>Host: ${process.env.EMAIL_HOST}</li>
            <li>Port: ${process.env.EMAIL_PORT}</li>
            <li>User: ${process.env.EMAIL_USER}</li>
            <li>From: ${process.env.EMAIL_FROM}</li>
          </ul>
          <p style="color: green; font-weight: bold;">✅ Everything is working!</p>
        </div>
      `,
            text: 'If you received this email, your email configuration is working correctly!',
        });
        console.log('✅ Test email sent successfully:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Test email failed:', error);
        return { success: false, error };
    }
}
