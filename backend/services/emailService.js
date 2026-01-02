import nodemailer from 'nodemailer';
import env from '../config/env.js';

/**
 * Create SMTP transporter
 */
const createTransporter = () => {
  if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS) {
    console.warn('⚠️ Email service not configured. Set SMTP_HOST, SMTP_USER, SMTP_PASS in .env');
    return null;
  }

  return nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: parseInt(env.SMTP_PORT) || 587,
    secure: env.SMTP_PORT === '465',
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS
    }
  });
};

const transporter = createTransporter();

/**
 * Send an email
 */
export const sendEmail = async ({ to, subject, text, html }) => {
  if (!transporter) {
    console.log('📧 [Email Debug] To:', to);
    console.log('📧 [Email Debug] Subject:', subject);
    return { messageId: 'not-configured' };
  }

  const info = await transporter.sendMail({
    from: `"HUStudent" <${env.SMTP_USER}>`,
    to,
    subject,
    text,
    html
  });

  console.log('✅ Email sent:', info.messageId);
  return info;
};

/**
 * Send password reset email
 */
export const sendPasswordResetEmail = async (email, resetUrl) => {
  const subject = 'Đặt lại mật khẩu - HUStudent';

  const text = `
Xin chào,

Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản HUStudent.

Click vào link sau để đặt lại mật khẩu:
${resetUrl}

Link này sẽ hết hạn sau 1 giờ.

Nếu bạn không yêu cầu, vui lòng bỏ qua email này.

HUStudent Team
`;

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea, #764ba2); padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0;">🎓 HUStudent</h1>
  </div>
  <div style="background: #fff; padding: 24px; border: 1px solid #e5e7eb; border-top: none;">
    <h2 style="margin-top: 0;">Đặt lại mật khẩu</h2>
    <p>Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản HUStudent.</p>
    <div style="text-align: center; margin: 24px 0;">
      <a href="${resetUrl}" style="background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">
        Đặt lại mật khẩu
      </a>
    </div>
    <p style="font-size: 14px; color: #666;">Link: <a href="${resetUrl}">${resetUrl}</a></p>
    <p style="background: #fef3c7; padding: 12px; border-radius: 8px; font-size: 14px;">⚠️ Link hết hạn sau 1 giờ.</p>
  </div>
  <div style="background: #f9fafb; padding: 16px; border-radius: 0 0 12px 12px; text-align: center; border: 1px solid #e5e7eb; border-top: none;">
    <p style="color: #9ca3af; font-size: 12px; margin: 0;">© 2026 HUStudent</p>
  </div>
</body>
</html>
`;

  return sendEmail({ to: email, subject, text, html });
};

export default { sendEmail, sendPasswordResetEmail };
