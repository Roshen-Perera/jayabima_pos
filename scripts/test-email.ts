// ⭐ ADD THIS AT THE TOP
import dotenv from 'dotenv';
dotenv.config();

import { testEmailConfiguration } from '../lib/email';

async function main() {
    console.log('🧪 Testing email configuration...\n');

    // ⭐ ADD THIS - Verify environment variables are loaded
    console.log('📧 Email User:', process.env.EMAIL_USER);
    console.log('🏠 Email Host:', process.env.EMAIL_HOST);
    console.log('🔌 Email Port:', process.env.EMAIL_PORT);
    console.log('');

    const result = await testEmailConfiguration();

    if (result.success) {
        console.log('\n✅ SUCCESS! Email sent.');
        console.log('📧 Check your inbox:', process.env.EMAIL_USER);
    } else {
        console.log('\n❌ FAILED!');
        console.log('Error:', result.error);
    }
}

main();