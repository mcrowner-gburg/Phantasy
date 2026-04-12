import twilio from 'twilio';

// SMS service using Twilio for league invites and authentication
export class SMSService {
  private client: twilio.Twilio | null = null;
  private fromNumber: string;

  constructor() {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    this.fromNumber = process.env.TWILIO_PHONE_NUMBER || '';

    if (accountSid && authToken && this.fromNumber) {
      this.client = twilio(accountSid, authToken);
    } else {
      console.warn('Twilio credentials not found. SMS functionality disabled.');
    }
  }

  async sendLeagueInvite(phoneNumber: string, leagueName: string, inviteCode: string): Promise<boolean> {
    if (!this.client) {
      console.warn('SMS service not initialized - Twilio credentials missing');
      return false;
    }

    try {
      const message = `🎵 You're invited to join "${leagueName}" on PhishDraft! Use code: ${inviteCode} or visit: ${process.env.REPLIT_DOMAINS || 'localhost'}/join/${inviteCode}`;
      
      await this.client.messages.create({
        body: message,
        from: this.fromNumber,
        to: phoneNumber,
      });

      return true;
    } catch (error) {
      console.error('SMS send error:', error);
      return false;
    }
  }

  async sendAuthCode(phoneNumber: string, code: string): Promise<boolean> {
    if (!this.client) {
      console.warn('SMS service not initialized - Twilio credentials missing');
      return false;
    }

    try {
      const message = `Your PhishDraft verification code is: ${code}. This code expires in 10 minutes.`;
      
      await this.client.messages.create({
        body: message,
        from: this.fromNumber,
        to: phoneNumber,
      });

      return true;
    } catch (error) {
      console.error('SMS auth code send error:', error);
      return false;
    }
  }

  async sendPasswordReset(phoneNumber: string, resetToken: string, baseUrl: string): Promise<boolean> {
    if (!this.client) {
      console.warn('SMS service not initialized - Twilio credentials missing');
      return false;
    }

    try {
      const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;
      const message = `PhishDraft: Reset your password at ${resetUrl}\n\nExpires in 1 hour. Ignore if you didn't request this.`;

      await this.client.messages.create({
        body: message,
        from: this.fromNumber,
        to: phoneNumber,
      });

      return true;
    } catch (error) {
      console.error('SMS password reset error:', error);
      return false;
    }
  }

  isAvailable(): boolean {
    return this.client !== null;
  }
}

export const smsService = new SMSService();