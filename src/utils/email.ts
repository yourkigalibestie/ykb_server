import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_EMAIL_API_KEY);
const fromEmail = process.env.RESEND_FROM_EMAIL ?? 'Kigali Bespoke Concierge <onboarding@resend.dev>';

export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
    if (!process.env.RESEND_EMAIL_API_KEY) {
        console.warn('RESEND_EMAIL_API_KEY not set. Email not sent.');
        return null;
    }
    const { data, error } = await resend.emails.send({ from: fromEmail, to, subject, html });
    if (error) throw new Error(error.message);
    return data;
}

export function buildVerificationEmail(name: string, code: string) {
    return `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 8px;">
      <h2 style="color: #1f2937;">Verify your email</h2>
      <p>Hi ${name},</p>
      <p>Your verification code is:</p>
      <div style="font-size: 28px; font-weight: bold; letter-spacing: 4px; background: #f3f4f6; padding: 16px; text-align: center; border-radius: 6px; margin: 16px 0;">${code}</div>
      <p style="color: #6b7280; font-size: 12px;">This code will expire in 1 hour.</p>
    </div>
  `;
}

export function buildPasswordResetEmail(name: string, resetUrl: string) {
    return `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 8px;">
      <h2 style="color: #1f2937;">Reset your password</h2>
      <p>Hi ${name},</p>
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background: #d4af37; color: #1f2937; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 16px 0;">Reset Password</a>
      <p style="color: #6b7280; font-size: 12px;">This link will expire in 1 hour. If you didn't request this, you can ignore this email.</p>
    </div>
  `;
}
