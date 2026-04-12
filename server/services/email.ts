import { Resend } from "resend";

let resend: Resend | null = null;
// Build from address from env vars to avoid Railway stripping angle brackets
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "noreply@phishphantasy.live";
const FROM_NAME  = process.env.RESEND_FROM_NAME  || "PhishDraft";
const FROM_ADDRESS = `${FROM_NAME} <${FROM_EMAIL}>`;

if (process.env.RESEND_API_KEY) {
  resend = new Resend(process.env.RESEND_API_KEY);
} else {
  console.warn("RESEND_API_KEY not set — email sending disabled");
}

export async function sendPasswordResetEmail(
  email: string,
  resetToken: string,
  baseUrl: string
): Promise<boolean> {
  if (!resend) {
    console.warn("sendPasswordResetEmail: Resend not configured, skipping");
    return false;
  }

  const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;

  console.log(`Sending password reset to ${email} from ${FROM_ADDRESS}`);
  try {
    const { error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to: email,
      subject: "PhishDraft — Password Reset",
      html: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #fff; padding: 32px; border-radius: 8px;">
  <h2 style="color: #22c55e; margin-top: 0;">Password Reset</h2>
  <p>You requested a password reset for your PhishDraft account.</p>
  <p style="margin: 24px 0;">
    <a href="${resetUrl}"
       style="background: #22c55e; color: #000; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
      Reset My Password
    </a>
  </p>
  <p style="color: #aaa; font-size: 13px;">Or paste this link in your browser:<br>
    <a href="${resetUrl}" style="color: #22c55e;">${resetUrl}</a>
  </p>
  <p style="color: #666; font-size: 12px; margin-top: 24px; border-top: 1px solid #222; padding-top: 16px;">
    This link expires in 1 hour. If you didn't request a reset, ignore this email.
  </p>
</div>
      `,
    });

    if (error) {
      console.error("Resend email error:", JSON.stringify(error));
      return false;
    }
    return true;
  } catch (error: any) {
    console.error("Resend email exception:", error?.message ?? error);
    return false;
  }
}
