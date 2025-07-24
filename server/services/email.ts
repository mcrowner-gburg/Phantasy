import { MailService } from '@sendgrid/mail';

if (!process.env.SENDGRID_API_KEY) {
  throw new Error("SENDGRID_API_KEY environment variable must be set");
}

const mailService = new MailService();
mailService.setApiKey(process.env.SENDGRID_API_KEY);

interface EmailParams {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html?: string;
}

export async function sendEmail(params: EmailParams): Promise<boolean> {
  try {
    await mailService.send({
      to: params.to,
      from: params.from,
      subject: params.subject,
      text: params.text,
      html: params.html,
    });
    return true;
  } catch (error) {
    console.error('SendGrid email error:', error);
    return false;
  }
}

export async function sendPasswordResetEmail(
  email: string,
  resetToken: string,
  baseUrl: string
): Promise<boolean> {
  const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;
  
  return sendEmail({
    to: email,
    from: 'noreply@phishdraft.com', // You can customize this
    subject: 'PhishDraft - Password Reset Request',
    text: `
Hello,

You requested a password reset for your PhishDraft account.

Click the link below to reset your password:
${resetUrl}

This link will expire in 1 hour.

If you didn't request this reset, please ignore this email.

Thanks,
The PhishDraft Team
    `,
    html: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #333;">Password Reset Request</h2>
  
  <p>Hello,</p>
  
  <p>You requested a password reset for your PhishDraft account.</p>
  
  <p>
    <a href="${resetUrl}" 
       style="background-color: #007cba; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
      Reset Password
    </a>
  </p>
  
  <p>Or copy and paste this link: <br>
     <a href="${resetUrl}">${resetUrl}</a>
  </p>
  
  <p style="color: #666; font-size: 14px;">
    This link will expire in 1 hour.
  </p>
  
  <p style="color: #666; font-size: 14px;">
    If you didn't request this reset, please ignore this email.
  </p>
  
  <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
  <p style="color: #999; font-size: 12px;">
    Thanks,<br>
    The PhishDraft Team
  </p>
</div>
    `
  });
}