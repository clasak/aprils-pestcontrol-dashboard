import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';
import * as sgMail from '@sendgrid/mail';
import { quoteEmailTemplate, QuoteEmailData } from './templates/quote-email.template';

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  cc?: string | string[];
  bcc?: string | string[];
  attachments?: EmailAttachment[];
  from?: string;
  replyTo?: string;
}

export interface EmailAttachment {
  filename: string;
  content: Buffer | string;
  contentType?: string;
  encoding?: string;
}

export interface SendQuoteEmailOptions {
  to: string;
  cc?: string[];
  quoteData: QuoteEmailData;
  customSubject?: string;
  customMessage?: string;
  pdfAttachment?: Buffer;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: Transporter | null = null;
  private useSendGrid: boolean = false;

  constructor(private readonly configService: ConfigService) {
    this.initializeTransporter();
  }

  private initializeTransporter(): void {
    const sendGridApiKey = this.configService.get<string>('SENDGRID_API_KEY');
    const smtpHost = this.configService.get<string>('SMTP_HOST');

    if (sendGridApiKey) {
      // Use SendGrid
      this.useSendGrid = true;
      sgMail.setApiKey(sendGridApiKey);
      this.logger.log('Email service initialized with SendGrid');
    } else if (smtpHost) {
      // Use SMTP (Nodemailer)
      this.transporter = nodemailer.createTransport({
        host: smtpHost,
        port: this.configService.get<number>('SMTP_PORT', 587),
        secure: this.configService.get<boolean>('SMTP_SECURE', false),
        auth: {
          user: this.configService.get<string>('SMTP_USER'),
          pass: this.configService.get<string>('SMTP_PASS'),
        },
      });
      this.logger.log('Email service initialized with SMTP');
    } else {
      // Development mode - use Ethereal for testing
      this.logger.warn('No email configuration found. Emails will be logged but not sent.');
    }
  }

  /**
   * Get default from address
   */
  private getFromAddress(): string {
    return this.configService.get<string>(
      'EMAIL_FROM',
      'April\'s Pest Control <noreply@aprilspestcontrol.com>'
    );
  }

  /**
   * Send an email
   */
  async sendEmail(options: EmailOptions): Promise<boolean> {
    const from = options.from || this.getFromAddress();

    try {
      if (this.useSendGrid) {
        return this.sendWithSendGrid({ ...options, from });
      } else if (this.transporter) {
        return this.sendWithNodemailer({ ...options, from });
      } else {
        // Development fallback - just log the email
        this.logger.log(`[DEV MODE] Email would be sent:`);
        this.logger.log(`  To: ${options.to}`);
        this.logger.log(`  Subject: ${options.subject}`);
        this.logger.log(`  Attachments: ${options.attachments?.length || 0}`);
        return true;
      }
    } catch (error) {
      this.logger.error(`Failed to send email: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Send email using SendGrid
   */
  private async sendWithSendGrid(options: EmailOptions): Promise<boolean> {
    const msg: sgMail.MailDataRequired = {
      to: options.to,
      from: options.from!,
      subject: options.subject,
      html: options.html,
      text: options.text || this.htmlToText(options.html),
    };

    if (options.cc) {
      msg.cc = options.cc;
    }
    if (options.bcc) {
      msg.bcc = options.bcc;
    }
    if (options.replyTo) {
      msg.replyTo = options.replyTo;
    }
    if (options.attachments?.length) {
      msg.attachments = options.attachments.map(att => ({
        filename: att.filename,
        content: Buffer.isBuffer(att.content) 
          ? att.content.toString('base64') 
          : att.content,
        type: att.contentType || 'application/octet-stream',
        disposition: 'attachment',
      }));
    }

    await sgMail.send(msg);
    this.logger.log(`Email sent via SendGrid to ${options.to}`);
    return true;
  }

  /**
   * Send email using Nodemailer (SMTP)
   */
  private async sendWithNodemailer(options: EmailOptions): Promise<boolean> {
    const mailOptions: nodemailer.SendMailOptions = {
      from: options.from,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || this.htmlToText(options.html),
    };

    if (options.cc) {
      mailOptions.cc = options.cc;
    }
    if (options.bcc) {
      mailOptions.bcc = options.bcc;
    }
    if (options.replyTo) {
      mailOptions.replyTo = options.replyTo;
    }
    if (options.attachments?.length) {
      mailOptions.attachments = options.attachments.map(att => ({
        filename: att.filename,
        content: att.content,
        contentType: att.contentType,
        encoding: att.encoding,
      }));
    }

    const result = await this.transporter!.sendMail(mailOptions);
    this.logger.log(`Email sent via SMTP to ${options.to}, messageId: ${result.messageId}`);
    return true;
  }

  /**
   * Send a quote email
   */
  async sendQuoteEmail(options: SendQuoteEmailOptions): Promise<boolean> {
    const { to, cc, quoteData, customSubject, customMessage, pdfAttachment } = options;

    const subject = customSubject || 
      `Your Quote from April's Pest Control - ${quoteData.quoteNumber}`;
    
    const html = quoteEmailTemplate({
      ...quoteData,
      customMessage,
    });

    const attachments: EmailAttachment[] = [];
    if (pdfAttachment) {
      attachments.push({
        filename: `Quote-${quoteData.quoteNumber}.pdf`,
        content: pdfAttachment,
        contentType: 'application/pdf',
      });
    }

    return this.sendEmail({
      to,
      cc,
      subject,
      html,
      attachments,
    });
  }

  /**
   * Simple HTML to text converter
   */
  private htmlToText(html: string): string {
    return html
      .replace(/<style[^>]*>.*?<\/style>/gi, '')
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/<[^>]+>/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Verify email configuration
   */
  async verifyConnection(): Promise<boolean> {
    if (this.transporter) {
      try {
        await this.transporter.verify();
        this.logger.log('SMTP connection verified');
        return true;
      } catch (error) {
        this.logger.error(`SMTP verification failed: ${error.message}`);
        return false;
      }
    }
    return this.useSendGrid;
  }
}

