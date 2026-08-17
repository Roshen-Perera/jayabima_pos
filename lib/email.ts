import nodemailer from 'nodemailer';

const EMAIL_HOST = process.env.EMAIL_HOST || 'smtp.gmail.com';
const EMAIL_PORT = parseInt(process.env.EMAIL_PORT || '587', 10);
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;
const DEFAULT_FROM = process.env.EMAIL_FROM || (EMAIL_USER ? `"JAYABIMA POS" <${EMAIL_USER}>` : '"JAYABIMA POS" <noreply@jayabima.com>');

if (!EMAIL_USER || !EMAIL_PASSWORD) {
    console.warn('⚠️ Warning: EMAIL_USER or EMAIL_PASSWORD not configured in .env!');
}

console.log('📧 Email Configuration:');
console.log('   Host:', EMAIL_HOST);
console.log('   Port:', EMAIL_PORT);
console.log('   User:', EMAIL_USER || '❌ Missing');
console.log('   From:', DEFAULT_FROM);
console.log('   Password:', EMAIL_PASSWORD ? '✅ Set' : '❌ Missing');

const transporter = nodemailer.createTransport({
    host: EMAIL_HOST,
    port: EMAIL_PORT,
    secure: EMAIL_PORT === 465, // true for 465, false for 587 or other ports
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASSWORD,
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
            from: DEFAULT_FROM,
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
            from: DEFAULT_FROM,
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
            from: DEFAULT_FROM,
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

// ... your existing imports and transporter setup ...

// Your existing functions:
// - sendPasswordResetEmail ✅
// - sendWelcomeEmail ✅
// - testEmailConfiguration ✅

// ADD THESE TWO NEW FUNCTIONS:

/**
 * Send welcome email with temporary password to new employee
 */
interface SendNewAccountEmailParams {
  email: string;
  name: string;
  username: string;
  temporaryPassword: string;
  role: string;
}

export async function sendNewAccountEmail({
  email,
  name,
  username,
  temporaryPassword,
  role,
}: SendNewAccountEmailParams): Promise<{
  success: boolean;
  messageId?: string;
  error?: any;
}> {
  try {
    const info = await transporter.sendMail({
      from: DEFAULT_FROM,
      to: email,
      subject: '🎉 Welcome to JAYABIMA POS - Your Account Details',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Welcome to JAYABIMA POS</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #f4f4f4; padding: 20px; border-radius: 10px;">
              
              <!-- Header -->
              <div style="background-color: #f97316; color: white; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 20px;">
                <h1 style="margin: 0;">🎉 Welcome to JAYABIMA POS!</h1>
              </div>
              
              <!-- Main Content -->
              <div style="background-color: white; padding: 30px; border-radius: 8px;">
                <p>Hi <strong>${name}</strong>,</p>
                
                <p>Your account has been created successfully! You've been assigned the role of <strong>${role}</strong>.</p>
                
                <!-- Credentials Box -->
                <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px;">
                  <h3 style="margin-top: 0; color: #92400e;">📝 Your Login Credentials</h3>
                  <p style="margin: 10px 0;"><strong>Username:</strong> ${username}</p>
                  <p style="margin: 10px 0;"><strong>Temporary Password:</strong></p>
                  <div style="background-color: #f3f4f6; padding: 15px; border-radius: 4px; text-align: center; margin: 10px 0;">
                    <code style="font-family: monospace; font-size: 18px; font-weight: bold; letter-spacing: 2px; color: #1f2937;">${temporaryPassword}</code>
                  </div>
                </div>
                
                <!-- Login Button -->
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${process.env.NEXT_PUBLIC_APP_URL}/login" 
                     style="background-color: #f97316; 
                            color: white; 
                            padding: 12px 30px; 
                            text-decoration: none; 
                            border-radius: 5px; 
                            display: inline-block;
                            font-weight: bold;">
                    Login Now
                  </a>
                </div>
                
                <!-- Security Warning -->
                <div style="background-color: #fee2e2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; border-radius: 4px;">
                  <h4 style="margin-top: 0; color: #991b1b;">🔒 Important Security Notice</h4>
                  <ul style="margin: 10px 0; padding-left: 20px; color: #7f1d1d;">
                    <li>This is a <strong>temporary password</strong></li>
                    <li>You will be required to <strong>change it</strong> on your first login</li>
                    <li>Do not share your password with anyone</li>
                    <li>Delete this email after changing your password</li>
                  </ul>
                </div>
                
                <!-- Next Steps -->
                <h3>Next Steps:</h3>
                <ol style="line-height: 1.8;">
                  <li>Click the "Login Now" button above</li>
                  <li>Enter your username and temporary password</li>
                  <li>Create a strong, unique password when prompted</li>
                  <li>Start using JAYABIMA POS!</li>
                </ol>
                
                <p>If you have any questions or need assistance, please contact your administrator.</p>
                
                <p>Best regards,<br>
                <strong>JAYABIMA Hardware Team</strong></p>
              </div>
              
              <!-- Footer -->
              <div style="text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd;">
                <p style="font-size: 12px; color: #666; margin: 5px 0;">
                  This is an automated message, please do not reply to this email.
                </p>
                <p style="font-size: 12px; color: #666; margin: 5px 0;">
                  &copy; ${new Date().getFullYear()} JAYABIMA Hardware. All rights reserved.
                </p>
              </div>
            </div>
          </body>
        </html>
      `,
      text: `
Welcome to JAYABIMA POS!

Hi ${name},

Your account has been created successfully! You've been assigned the role of ${role}.

Your Login Credentials:
- Username: ${username}
- Temporary Password: ${temporaryPassword}

IMPORTANT SECURITY NOTICE:
- This is a temporary password
- You will be required to change it on your first login
- Do not share your password with anyone

Next Steps:
1. Go to ${process.env.NEXT_PUBLIC_APP_URL}/login
2. Enter your username and temporary password
3. Create a strong, unique password when prompted
4. Start using JAYABIMA POS!

If you have any questions or need assistance, please contact your administrator.

Best regards,
JAYABIMA Hardware Team
      `,
    });

    console.log('✅ Welcome email with credentials sent successfully');
    console.log('📧 Message ID:', info.messageId);
    console.log('📬 Sent to:', email);

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ New account email sending failed:', error);
    return { success: false, error };
  }
}

/**
 * Send email when admin resets user's password
 */
interface SendPasswordResetByAdminEmailParams {
  email: string;
  name: string;
  username: string;
  temporaryPassword: string;
  resetBy: string;
}

export async function sendPasswordResetByAdminEmail({
  email,
  name,
  username,
  temporaryPassword,
  resetBy,
}: SendPasswordResetByAdminEmailParams): Promise<{
  success: boolean;
  messageId?: string;
  error?: any;
}> {
  try {
    const info = await transporter.sendMail({
      from: DEFAULT_FROM,
      to: email,
      subject: '🔒 Your Password Has Been Reset - JAYABIMA POS',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Password Reset</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #f4f4f4; padding: 20px; border-radius: 10px;">
              
              <!-- Header -->
              <div style="background-color: #ef4444; color: white; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 20px;">
                <h1 style="margin: 0;">🔒 Password Reset Notice</h1>
              </div>
              
              <!-- Main Content -->
              <div style="background-color: white; padding: 30px; border-radius: 8px;">
                <p>Hi <strong>${name}</strong>,</p>
                
                <p>Your password has been reset by <strong>${resetBy}</strong>.</p>
                
                <!-- Credentials Box -->
                <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px;">
                  <h3 style="margin-top: 0; color: #92400e;">🔑 Your New Login Credentials</h3>
                  <p style="margin: 10px 0;"><strong>Username:</strong> ${username}</p>
                  <p style="margin: 10px 0;"><strong>Temporary Password:</strong></p>
                  <div style="background-color: #f3f4f6; padding: 15px; border-radius: 4px; text-align: center; margin: 10px 0;">
                    <code style="font-family: monospace; font-size: 18px; font-weight: bold; letter-spacing: 2px; color: #1f2937;">${temporaryPassword}</code>
                  </div>
                </div>
                
                <!-- Login Button -->
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${process.env.NEXT_PUBLIC_APP_URL}/login" 
                     style="background-color: #ef4444; 
                            color: white; 
                            padding: 12px 30px; 
                            text-decoration: none; 
                            border-radius: 5px; 
                            display: inline-block;
                            font-weight: bold;">
                    Login Now
                  </a>
                </div>
                
                <!-- Security Warning -->
                <div style="background-color: #fee2e2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; border-radius: 4px;">
                  <h4 style="margin-top: 0; color: #991b1b;">🔒 Important Security Notice</h4>
                  <ul style="margin: 10px 0; padding-left: 20px; color: #7f1d1d;">
                    <li>This is a <strong>temporary password</strong></li>
                    <li>You <strong>must change it</strong> when you log in</li>
                    <li>If you did not request this reset, contact your administrator immediately</li>
                    <li>Delete this email after changing your password</li>
                  </ul>
                </div>
                
                <!-- Next Steps -->
                <h3>Next Steps:</h3>
                <ol style="line-height: 1.8;">
                  <li>Click the "Login Now" button above</li>
                  <li>Enter your username and temporary password</li>
                  <li>Create a new strong password when prompted</li>
                </ol>
                
                <p>If you have any questions, please contact your administrator.</p>
                
                <p>Best regards,<br>
                <strong>JAYABIMA Hardware Team</strong></p>
              </div>
              
              <!-- Footer -->
              <div style="text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd;">
                <p style="font-size: 12px; color: #666; margin: 5px 0;">
                  This is an automated message, please do not reply to this email.
                </p>
                <p style="font-size: 12px; color: #666; margin: 5px 0;">
                  &copy; ${new Date().getFullYear()} JAYABIMA Hardware. All rights reserved.
                </p>
              </div>
            </div>
          </body>
        </html>
      `,
      text: `
Password Reset Notice

Hi ${name},

Your password has been reset by ${resetBy}.

Your New Login Credentials:
- Username: ${username}
- Temporary Password: ${temporaryPassword}

IMPORTANT:
- This is a temporary password
- You must change it when you log in
- If you did not request this reset, contact your administrator immediately

Login at: ${process.env.NEXT_PUBLIC_APP_URL}/login

Best regards,
JAYABIMA Hardware Team
      `,
    });

    console.log('✅ Password reset by admin email sent successfully');
    console.log('📧 Message ID:', info.messageId);
    console.log('📬 Sent to:', email);

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Password reset email sending failed:', error);
    return { success: false, error };
  }
}

interface SendCustomerStatementEmailParams {
  email: string;
  name: string;
  statementDateStr: string;
  ref: string;
  totalBilled: number;
  totalPaid: number;
  netOutstanding: number;
  pdfBuffer?: Buffer;
}

export async function sendCustomerStatementEmail({
  email,
  name,
  statementDateStr,
  ref,
  totalBilled,
  totalPaid,
  netOutstanding,
  pdfBuffer,
}: SendCustomerStatementEmailParams) {
  try {
    const attachments = pdfBuffer
      ? [
          {
            filename: `Statement_${ref}.pdf`,
            content: pdfBuffer,
            contentType: "application/pdf",
          },
        ]
      : [];

    const info = await transporter.sendMail({
      from: DEFAULT_FROM,
      to: email,
      subject: `Official Statement of Account (${statementDateStr}) - JAYABIMA HARDWARE`,
      attachments,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: 'Segoe UI', Arial, sans-serif; color: #0f172a; background-color: #f1f5f9; padding: 20px; margin: 0; }
              .card { max-width: 580px; background: #ffffff; margin: 0 auto; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); overflow: hidden; }
              .header-banner { background: #0f172a; padding: 24px; text-align: center; color: #ffffff; }
              .body-content { padding: 28px; }
              .greeting { font-size: 15px; font-weight: 700; color: #0f172a; margin-bottom: 8px; }
              .subtext { font-size: 13px; color: #475569; line-height: 1.6; margin-bottom: 20px; }
              
              .summary-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 20px; }
              .summary-title { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; margin-bottom: 12px; }
              
              .pdf-alert-box { background: #eff6ff; border-left: 4px solid #2563eb; padding: 14px; border-radius: 6px; margin-bottom: 20px; }
              .pdf-alert-title { font-size: 12px; font-weight: 700; color: #1e40af; margin-bottom: 2px; }
              .pdf-alert-desc { font-size: 11px; color: #1e3a8a; line-height: 1.4; }

              .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 18px; text-align: center; font-size: 11px; color: #64748b; line-height: 1.5; }
            </style>
          </head>
          <body>
            <div class="card">
              <div class="header-banner">
                <div style="font-size: 18px; font-weight: bold; letter-spacing: 0.5px;">JAYABIMA HARDWARE & STORES</div>
                <div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">No 28/D, Rathnapura Road, Diurumpitiya, Getaheththa | Tel: 0777187729</div>
              </div>
              
              <div class="body-content">
                <div class="greeting">Dear ${name},</div>
                <div class="subtext">
                  Please find your official Account Statement for <strong>${statementDateStr}</strong> (Ref: <code style="font-family: monospace; background: #e2e8f0; padding: 2px 4px; border-radius: 4px;">${ref}</code>).
                </div>

                <div class="summary-card">
                  <div class="summary-title">Account Balance Summary</div>
                  <table style="width: 100%; border-collapse: separate; border-spacing: 6px;">
                    <tr>
                      <td style="background: #ffffff; border: 1px solid #cbd5e1; border-radius: 6px; padding: 10px; text-align: center; width: 33%;">
                        <div style="font-size: 9px; font-weight: bold; text-transform: uppercase; color: #64748b;">Total Billed</div>
                        <div style="font-size: 12px; font-weight: bold; color: #0f172a; margin-top: 4px;">LKR ${totalBilled.toLocaleString("en-US", { minimumFractionDigits: 2 })}</div>
                      </td>
                      <td style="background: #ffffff; border: 1px solid #cbd5e1; border-radius: 6px; padding: 10px; text-align: center; width: 33%;">
                        <div style="font-size: 9px; font-weight: bold; text-transform: uppercase; color: #64748b;">Total Paid</div>
                        <div style="font-size: 12px; font-weight: bold; color: #047857; margin-top: 4px;">LKR ${totalPaid.toLocaleString("en-US", { minimumFractionDigits: 2 })}</div>
                      </td>
                      <td style="background: #ffffff; border: 1px solid #cbd5e1; border-radius: 6px; padding: 10px; text-align: center; width: 33%;">
                        <div style="font-size: 9px; font-weight: bold; text-transform: uppercase; color: #64748b;">Net Owed</div>
                        <div style="font-size: 12px; font-weight: bold; color: ${netOutstanding > 0 ? '#dc2626' : '#047857'}; margin-top: 4px;">LKR ${netOutstanding.toLocaleString("en-US", { minimumFractionDigits: 2 })}</div>
                      </td>
                    </tr>
                  </table>
                </div>

                <div class="pdf-alert-box">
                  <div class="pdf-alert-title">📎 Attached Statement Document</div>
                  <div class="pdf-alert-desc">
                    Your complete transaction ledger history is securely attached to this email as a PDF document (<strong>Statement_${ref}.pdf</strong>).
                  </div>
                </div>

                <div style="font-size: 12px; color: #475569; line-height: 1.5;">
                  If you have any questions regarding your statement or balance, please contact Jayabima Hardware at <strong>0777187729 / 0362231535</strong>.
                </div>
              </div>

              <div class="footer">
                <div>This is an automated notification email from Jayabima Hardware & Stores. Please do not reply directly.</div>
                <div>&copy; ${new Date().getFullYear()} Jayabima Hardware & Stores. All rights reserved.</div>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    console.log('✅ Statement email sent successfully');
    console.log('📧 Message ID:', info.messageId);
    console.log('📬 Sent to:', email);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Statement email sending failed:', error);
    return { success: false, error };
  }
}

interface SendSupplierStatementEmailParams {
  email: string;
  name: string;
  statementDateStr: string;
  ref: string;
  totalBilled: number;
  totalPaid: number;
  netOutstanding: number;
  pdfBuffer?: Buffer;
}

export async function sendSupplierStatementEmail({
  email,
  name,
  statementDateStr,
  ref,
  totalBilled,
  totalPaid,
  netOutstanding,
  pdfBuffer,
}: SendSupplierStatementEmailParams) {
  try {
    const attachments = pdfBuffer
      ? [
          {
            filename: `Supplier_Statement_${ref}.pdf`,
            content: pdfBuffer,
            contentType: "application/pdf",
          },
        ]
      : [];

    const info = await transporter.sendMail({
      from: DEFAULT_FROM,
      to: email,
      subject: `Official Supplier Statement of Account (${statementDateStr}) - JAYABIMA HARDWARE`,
      attachments,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: 'Segoe UI', Arial, sans-serif; color: #0f172a; background-color: #f1f5f9; padding: 20px; margin: 0; }
              .card { max-width: 580px; background: #ffffff; margin: 0 auto; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); overflow: hidden; }
              .header-banner { background: #0f172a; padding: 24px; text-align: center; color: #ffffff; }
              .body-content { padding: 28px; }
              .greeting { font-size: 15px; font-weight: 700; color: #0f172a; margin-bottom: 8px; }
              .subtext { font-size: 13px; color: #475569; line-height: 1.6; margin-bottom: 20px; }
              
              .summary-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 20px; }
              .summary-title { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; margin-bottom: 12px; }
              
              .pdf-alert-box { background: #eff6ff; border-left: 4px solid #2563eb; padding: 14px; border-radius: 6px; margin-bottom: 20px; }
              .pdf-alert-title { font-size: 12px; font-weight: 700; color: #1e40af; margin-bottom: 2px; }
              .pdf-alert-desc { font-size: 11px; color: #1e3a8a; line-height: 1.4; }

              .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 18px; text-align: center; font-size: 11px; color: #64748b; line-height: 1.5; }
            </style>
          </head>
          <body>
            <div class="card">
              <div class="header-banner">
                <div style="font-size: 18px; font-weight: bold; letter-spacing: 0.5px;">JAYABIMA HARDWARE & STORES</div>
                <div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">No 28/D, Rathnapura Road, Diurumpitiya, Getaheththa | Tel: 0777187729</div>
              </div>
              
              <div class="body-content">
                <div class="greeting">Dear ${name},</div>
                <div class="subtext">
                  Please find the official Supplier Account Statement for <strong>${statementDateStr}</strong> (Ref: <code style="font-family: monospace; background: #e2e8f0; padding: 2px 4px; border-radius: 4px;">${ref}</code>).
                </div>

                <div class="summary-card">
                  <div class="summary-title">Account Balance Summary</div>
                  <table style="width: 100%; border-collapse: separate; border-spacing: 6px;">
                    <tr>
                      <td style="background: #ffffff; border: 1px solid #cbd5e1; border-radius: 6px; padding: 10px; text-align: center; width: 33%;">
                        <div style="font-size: 9px; font-weight: bold; text-transform: uppercase; color: #64748b;">Total Billed</div>
                        <div style="font-size: 12px; font-weight: bold; color: #0f172a; margin-top: 4px;">LKR ${totalBilled.toLocaleString("en-US", { minimumFractionDigits: 2 })}</div>
                      </td>
                      <td style="background: #ffffff; border: 1px solid #cbd5e1; border-radius: 6px; padding: 10px; text-align: center; width: 33%;">
                        <div style="font-size: 9px; font-weight: bold; text-transform: uppercase; color: #64748b;">Total Paid</div>
                        <div style="font-size: 12px; font-weight: bold; color: #047857; margin-top: 4px;">LKR ${totalPaid.toLocaleString("en-US", { minimumFractionDigits: 2 })}</div>
                      </td>
                      <td style="background: #ffffff; border: 1px solid #cbd5e1; border-radius: 6px; padding: 10px; text-align: center; width: 33%;">
                        <div style="font-size: 9px; font-weight: bold; text-transform: uppercase; color: #64748b;">Net Payable</div>
                        <div style="font-size: 12px; font-weight: bold; color: ${netOutstanding > 0 ? '#dc2626' : '#047857'}; margin-top: 4px;">LKR ${netOutstanding.toLocaleString("en-US", { minimumFractionDigits: 2 })}</div>
                      </td>
                    </tr>
                  </table>
                </div>

                <div class="pdf-alert-box">
                  <div class="pdf-alert-title">📎 Attached Statement Document</div>
                  <div class="pdf-alert-desc">
                    Your complete transaction ledger history is securely attached to this email as a PDF document (<strong>Supplier_Statement_${ref}.pdf</strong>).
                  </div>
                </div>

                <div style="font-size: 12px; color: #475569; line-height: 1.5;">
                  If you have any questions regarding your statement or balance, please contact Jayabima Hardware at <strong>0777187729 / 0362231535</strong>.
                </div>
              </div>

              <div class="footer">
                <div>This is an automated notification email from Jayabima Hardware & Stores. Please do not reply directly.</div>
                <div>&copy; ${new Date().getFullYear()} Jayabima Hardware & Stores. All rights reserved.</div>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    console.log('✅ Supplier statement email sent successfully');
    console.log('📧 Message ID:', info.messageId);
    console.log('📬 Sent to:', email);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Supplier statement email sending failed:', error);
    return { success: false, error };
  }
}