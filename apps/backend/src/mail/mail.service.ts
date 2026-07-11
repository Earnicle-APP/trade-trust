import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly resend: Resend | null = null;
  private readonly appUrl: string;
  private readonly from: string;

  constructor(private configService: ConfigService) {
    this.appUrl =
      configService.get<string>('APP_URL') || 'http://localhost:3000';
    this.from =
      configService.get<string>('RESEND_FROM') ||
      'Acme <onboarding@resend.dev>';

    const apiKey = configService.get<string>('RESEND_API_KEY');
    if (apiKey) {
      this.resend = new Resend(apiKey);
      this.logger.log('Resend mail transport configured');
    } else {
      this.logger.warn(
        'RESEND_API_KEY not set — emails will be logged to console only',
      );
    }
  }

  async sendVerificationEmail(
    email: string,
    token: string,
    name: string,
  ): Promise<void> {
    const link = `${this.appUrl}/verify-email?token=${token}`;

    await this.send({
      to: email,
      subject: 'Verify your TradeTrust account',
      html: `<p>Hi ${name},</p><p>Please verify your email by clicking the link below:</p><p><a href="${link}">${link}</a></p><p>This link expires in 24 hours.</p><p>— TradeTrust team</p>`,
    });
  }

  async sendPasswordResetEmail(
    email: string,
    token: string,
    name: string,
  ): Promise<void> {
    const link = `${this.appUrl}/reset-password?token=${token}`;

    await this.send({
      to: email,
      subject: 'Reset your TradeTrust password',
      html: `<p>Hi ${name},</p><p>You requested a password reset. Click the link below to set a new password:</p><p><a href="${link}">${link}</a></p><p>This link expires in 1 hour. If you didn't request this, ignore this email.</p><p>— TradeTrust team</p>`,
    });
  }

  private async send(opts: {
    to: string;
    subject: string;
    html: string;
  }): Promise<void> {
    if (this.resend) {
      const { error } = await this.resend.emails.send({
        from: this.from,
        to: [opts.to],
        subject: opts.subject,
        html: opts.html,
      });

      if (error) {
        this.logger.error(`Failed to send email: ${error.message}`, error);
      }
    } else {
      this.logger.log('--- EMAIL ---');
      this.logger.log(`To: ${opts.to}`);
      this.logger.log(`Subject: ${opts.subject}`);
      this.logger.log(`Body: ${opts.html.replace(/<[^>]*>/g, '')}`);
      this.logger.log('--- END EMAIL ---');
    }
  }
}
