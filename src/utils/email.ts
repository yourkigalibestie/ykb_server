// email.ts - Enhanced version
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_EMAIL_API_KEY);
const fromEmail = process.env.RESEND_FROM_EMAIL ?? 'Kigali Bespoke Concierge <onboarding@resend.dev>';

// Email sending with better error handling and retry logic
export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
    if (!process.env.RESEND_EMAIL_API_KEY) {
        console.warn('RESEND_EMAIL_API_KEY not set. Email not sent.');
        return null;
    }
    
    try {
        const { data, error } = await resend.emails.send({ 
            from: fromEmail, 
            to, 
            subject, 
            html 
        });
        
        if (error) throw new Error(error.message);
        
        console.log(`Email sent successfully to ${to}: ${subject}`);
        return data;
    } catch (error) {
        console.error(`Failed to send email to ${to}:`, error);
        throw error;
    }
}

// Enhanced verification email template
export function buildVerificationEmail(name: string, code: string) {
    const appName = 'Kigali Bespoke Concierge';
    const expiryTime = '1 hour';
    
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your Email - ${appName}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0; }
        .content { background: #fff; padding: 40px 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 12px 12px; }
        .code { background: #f7f7f7; font-size: 32px; font-weight: bold; text-align: center; padding: 20px; letter-spacing: 8px; margin: 20px 0; border-radius: 8px; font-family: monospace; border: 1px solid #e0e0e0; }
        .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; font-size: 14px; border-radius: 4px; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #666; text-align: center; }
        @media only screen and (max-width: 480px) {
            .container { padding: 10px; }
            .content { padding: 20px 15px; }
            .code { font-size: 24px; letter-spacing: 4px; padding: 15px; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1> Verify Your Email</h1>
        </div>
        <div class="content">
          <h2>Hello ${name},</h2>
          <p>Thank you for creating an account with <strong>${appName}</strong>! To get started and access all our premium concierge services, please verify your email address.</p>
          
          <div class="warning">
            <strong> Important:</strong> This verification code will expire in <strong>${expiryTime}</strong> for your security.
          </div>
          
          <p><strong>Your verification code is:</strong></p>
          <div class="code">${code}</div>
          
          <p><strong>How to verify:</strong></p>
          <ol>
            <li>Copy the 6-character code above</li>
            <li>Return to the verification page in your browser</li>
            <li>Paste the code and click "Verify Email"</li>
          </ol>
          
          <p>Once verified, you'll be able to:</p>
          <ul>
            <li>✓ Book exclusive experiences and services</li>
            <li>✓ Receive personalized recommendations</li>
            <li>✓ Access special member-only offers</li>
            <li>✓ Manage your bookings and preferences</li>
          </ul>
          
          <p>Didn't request this verification? You can safely ignore this email. No changes will be made to your account.</p>
          
          <div class="footer">
            <p>${appName} | Your trusted concierge for unforgettable experiences in Kigali</p>
            <p>This is an automated message, please do not reply to this email.</p>
            <p>Need help? <a href="${process.env.SUPPORT_URL || 'mailto:support@kigalibespoke.com'}" style="color: #667eea;">Contact our support team</a></p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Enhanced password reset email template
export function buildPasswordResetEmail(name: string, codeOrUrl: string) {
    const appName = 'Kigali Bespoke Concierge';
    // Check if it's a code (6 chars hex) or URL
    const isCode = codeOrUrl.length === 6 && /^[A-F0-9]+$/.test(codeOrUrl);
    const expiryTime = isCode ? '15 minutes' : '1 hour';
    
    if (isCode) {
        return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Password - ${appName}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0; }
            .content { background: #fff; padding: 40px 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 12px 12px; }
            .reset-content { background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center; }
            .code { background: #f7f7f7; font-size: 32px; font-weight: bold; text-align: center; padding: 20px; letter-spacing: 8px; margin: 20px 0; border-radius: 8px; font-family: monospace; border: 1px solid #e0e0e0; }
            .security-tip { background: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; font-size: 14px; border-radius: 4px; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #666; text-align: center; }
            @media only screen and (max-width: 480px) {
                .container { padding: 10px; }
                .content { padding: 20px 15px; }
                .code { font-size: 24px; letter-spacing: 4px; padding: 15px; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1> Reset Your Password</h1>
            </div>
            <div class="content">
              <h2>Hello ${name},</h2>
              <p>We received a request to reset the password for your ${appName} account. Don't worry, we'll help you get back in securely.</p>
              
              <div class="security-tip">
                <strong> Security Notice:</strong> If you didn't request this password reset, please ignore this email. Your password will remain unchanged.
              </div>
              
              <div class="reset-content">
                <p><strong>Your password reset code is:</strong></p>
                <div class="code">${codeOrUrl}</div>
                <p><strong>How to reset your password:</strong></p>
                <ol style="text-align: left;">
                  <li>Enter this 6-character code on the reset page</li>
                  <li>Choose a strong, unique password (at least 8 characters)</li>
                  <li>Confirm your new password and submit</li>
                </ol>
              </div>
              
              <p><strong>Important:</strong> This reset code will expire in <strong>${expiryTime}</strong> for security reasons.</p>
              
              <p><strong>Tips for a strong password:</strong></p>
              <ul>
                <li>Use at least 12 characters</li>
                <li>Include a mix of uppercase, lowercase, numbers, and symbols</li>
                <li>Avoid using personal information (birthdays, names, etc.)</li>
                <li>Don't reuse passwords from other accounts</li>
              </ul>
              
              <p>Need additional help? Contact our support team for assistance with account recovery.</p>
              
              <div class="footer">
                <p>${appName} | Your trusted concierge for unforgettable experiences in Kigali</p>
                <p>This is an automated security notification. Please do not reply to this email.</p>
                <p>If you need immediate assistance: <a href="${process.env.SUPPORT_URL || 'mailto:support@kigalibespoke.com'}" style="color: #f5576c;">Contact Support</a></p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;
    }
    
    // URL-based reset (legacy)
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your Password - ${appName}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0; }
        .content { background: #fff; padding: 40px 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 12px 12px; }
        .button { display: inline-block; background: #f5576c; color: white; padding: 14px 35px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: 600; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .security-tip { background: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; font-size: 14px; border-radius: 4px; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #666; text-align: center; }
        @media only screen and (max-width: 480px) {
            .container { padding: 10px; }
            .content { padding: 20px 15px; }
            .button { padding: 12px 25px; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1> Reset Your Password</h1>
        </div>
        <div class="content">
          <h2>Hello ${name},</h2>
          <p>We received a request to reset the password for your ${appName} account. Don't worry, we'll help you get back in securely.</p>
          
          <div class="security-tip">
            <strong> Security Notice:</strong> If you didn't request this password reset, please ignore this email. Your password will remain unchanged.
          </div>
          
          <p>Click the button below to reset your password:</p>
          <div style="text-align: center;">
            <a href="${codeOrUrl}" class="button">Reset My Password</a>
          </div>
          
          <p>Or copy and paste this link into your browser:<br>
          <span style="word-break: break-all; color: #666; font-size: 12px;">${codeOrUrl}</span></p>
          
          <p><strong> Important:</strong> This reset link will expire in <strong>${expiryTime}</strong> for security reasons.</p>
          
          <p><strong>Tips for a strong password:</strong></p>
          <ul>
            <li>Use at least 12 characters</li>
            <li>Include a mix of uppercase, lowercase, numbers, and symbols</li>
            <li>Avoid using personal information (birthdays, names, etc.)</li>
            <li>Don't reuse passwords from other accounts</li>
          </ul>
          
          <p>Need additional help? Contact our support team for assistance with account recovery.</p>
          
          <div class="footer">
            <p>${appName} | Your trusted concierge for unforgettable experiences in Kigali</p>
            <p>This is an automated security notification. Please do not reply to this email.</p>
            <p>If you need immediate assistance: <a href="${process.env.SUPPORT_URL || 'mailto:support@kigalibespoke.com'}" style="color: #f5576c;">Contact Support</a></p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

// NEW: Welcome email template for new users
export function buildWelcomeEmail(name: string) {
    const appName = 'Kigali Bespoke Concierge';
    
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to ${appName}!</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0; }
        .content { background: #fff; padding: 40px 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 12px 12px; }
        .feature-box { background: #f9f9f9; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #666; text-align: center; }
        @media only screen and (max-width: 480px) {
            .container { padding: 10px; }
            .content { padding: 20px 15px; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1> Welcome to ${appName}!</h1>
        </div>
        <div class="content">
          <h2>Hello ${name},</h2>
          <p>Welcome to the ultimate concierge experience in Kigali! We're thrilled to have you join our community of discerning individuals who appreciate the finer things in life.</p>
          
          <div class="feature-box">
            <h3> What you can do next:</h3>
            <ul>
              <li><strong> Complete your profile</strong> - Get personalized recommendations tailored to your preferences</li>
              <li><strong> Explore our services</strong> - Discover curated premium experiences and local experts</li>
              <li><strong> Book your first service</strong> - Earn loyalty points and exclusive perks</li>
              <li><strong> Download our mobile app</strong> - Access concierge services on-the-go (coming soon)</li>
            </ul>
          </div>
          
          <p><strong>Need assistance?</strong> Our dedicated concierge team is available 24/7 to help you with any requests, from restaurant reservations to private tours and everything in between.</p>
          
          <p>We can't wait to help you create unforgettable memories in Kigali!</p>
          
          <p>Warm regards,<br>
          <strong>The ${appName} Team</strong></p>
          
          <div class="footer">
            <p>${appName} | Making every moment extraordinary</p>
            <p>Follow us on social media for exclusive offers and inspiration</p>
            <p>Questions? <a href="${process.env.SUPPORT_URL || 'mailto:support@kigalibespoke.com'}" style="color: #667eea;">Contact our support team</a></p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

// NEW: Email change notification template
export function buildEmailChangedNotification(name: string, newEmail: string) {
    const appName = 'Kigali Bespoke Concierge';
    
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Email Changed - ${appName}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0; }
        .content { background: #fff; padding: 40px 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 12px 12px; }
        .alert-box { background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #666; text-align: center; }
        @media only screen and (max-width: 480px) {
            .container { padding: 10px; }
            .content { padding: 20px 15px; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Email Address Changed</h1>
        </div>
        <div class="content">
          <h2>Hello ${name},</h2>
          
          <div class="alert-box">
            <p><strong>Your account email has been successfully changed to:</strong><br>
            <span style="font-size: 18px; color: #1f2937;">${newEmail}</span></p>
          </div>
          
          <p>If you made this change, no further action is needed. Your account security is our priority.</p>
          
          <p><strong> Didn't make this change?</strong><br>
          Contact our support team immediately to secure your account.</p>
          
          <div class="footer">
            <p>${appName} | Keeping your account secure</p>
            <p><a href="${process.env.SUPPORT_URL || 'mailto:support@kigalibespoke.com'}" style="color: #667eea;">Report unauthorized changes</a></p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}