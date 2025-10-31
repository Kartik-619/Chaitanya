require('dotenv').config();
const nodemailer = require('nodemailer');

console.log('🔍 Testing SMTP Configuration...\n');
console.log('SMTP_HOST:', process.env.SMTP_HOST);
console.log('SMTP_PORT:', process.env.SMTP_PORT);
console.log('SMTP_USER:', process.env.SMTP_USER);
console.log('EMAIL_FROM:', process.env.EMAIL_FROM);
console.log('SMTP_PASS:', process.env.SMTP_PASS ? '***' + process.env.SMTP_PASS.slice(-4) : 'NOT SET');
console.log('\n');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    },
    connectionTimeout: 5000,
    greetingTimeout: 5000,
    socketTimeout: 5000,
    pool: true,
    maxConnections: 10,
    maxMessages: 100,
    tls: {
        rejectUnauthorized: true,
        minVersion: 'TLSv1.2'
    }
});

console.log('⏳ Verifying SMTP connection...\n');

transporter.verify((error, success) => {
    if (error) {
        console.error('❌ SMTP Connection Failed:', error.message);
        console.error('Full error:', error);
        process.exit(1);
    } else {
        console.log('✅ SMTP Server Ready - Connection Pool Active');
        console.log('✅ Email service is working correctly!\n');
        
        // Send test OTP email
        console.log('📧 Sending test OTP email...\n');
        
        const testOTP = '123456';
        const testEmail = process.env.UNIVERSITY_EMAIL || process.env.EMAIL_FROM;
        
        const mailOptions = {
            from: {
                name: 'Chaitanya 2025 - HPTU',
                address: process.env.EMAIL_FROM
            },
            to: testEmail,
            replyTo: process.env.EMAIL_FROM,
            subject: 'Test OTP - Chaitanya 2025',
            text: `Your test OTP is: ${testOTP}`,
            html: `<h2>Test OTP Email</h2><p>Your test OTP is: <strong>${testOTP}</strong></p>`,
            headers: {
                'X-Priority': '1',
                'X-MSMail-Priority': 'High',
                'Importance': 'high'
            }
        };
        
        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.error('❌ Test email failed:', err.message);
                process.exit(1);
            } else {
                console.log('✅ Test email sent successfully!');
                console.log('Message ID:', info.messageId);
                console.log('Check your inbox:', testEmail);
                console.log('\n🎉 SMTP configuration is working perfectly!');
                process.exit(0);
            }
        });
    }
});
