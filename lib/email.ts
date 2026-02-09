import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

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
        const { data, error } = await resend.emails.send({
            from: 'JAYABIMA POS <noreply@yourdomain.com>', // Change this
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
        });

        if (error) {
            console.error('Error sending email:', error);
            return { success: false, error };
        }

        console.log('Email sent successfully:', data);
        return { success: true, data };
    } catch (error) {
        console.error('Email sending failed:', error);
        return { success: false, error };
    }
}

export async function sendWelcomeEmail(email: string, name: string) {
    try {
        const { data, error } = await resend.emails.send({
            from: 'JAYABIMA POS <onboarding@resend.dev>',
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
              
              <ul>
                <li>Manage Inventory</li>
                <li>Process Sales</li>
                <li>Track Customers</li>
                <li>Generate Reports</li>
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
            </div>
          </body>
        </html>
      `,
        });
        if (error) {
            console.error('Error sending welcome email:', error);
            return { success: false, error };
        }
        console.log('✅ Welcome email sent successfully:', data);
        return { success: true, data };
    } catch (error) {
        console.error('❌ Welcome email sending failed:', error);
        return { success: false, error };
    }
}