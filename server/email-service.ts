import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

class EmailService {
  private transporter!: nodemailer.Transporter;
  private isInitialized = false;

  constructor() {
    this.initializeTransporter();
  }

  private async initializeTransporter() {
    try {
      // First, try to load SMTP config from file
      let useConfigFile = false;
      let smtpConfig: any = null;
      
      try {
        const fs = await import('fs/promises');
        const path = await import('path');
        const configPath = path.join(process.cwd(), 'server', 'config', 'smtp-config.json');
        const configData = await fs.readFile(configPath, 'utf8');
        smtpConfig = JSON.parse(configData);
        useConfigFile = smtpConfig.isActive;
      } catch (error) {
        console.log('No SMTP config file found, falling back to environment variables');
      }

      if (useConfigFile && smtpConfig) {
        // Use SMTP configuration from file
        this.transporter = nodemailer.createTransport({
          host: smtpConfig.host,
          port: smtpConfig.port,
          secure: smtpConfig.secure, // true for 465, false for 587
          auth: {
            user: smtpConfig.auth.user,
            pass: smtpConfig.auth.pass
          }
        });
        
        console.log(`Email service initialized with file config (${smtpConfig.host}:${smtpConfig.port})`);
        this.isInitialized = true;
        return;
      }

      // Check if real SMTP credentials are provided
      if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        // Use real SMTP configuration
        this.transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST || 'smtp.gmail.com',
          port: parseInt(process.env.SMTP_PORT || '587'),
          secure: false, // true for 465, false for other ports
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
          }
        });
        console.log('Email service initialized with real SMTP credentials');
      } else {
        // Use Ethereal Email for testing
        const testAccount = await nodemailer.createTestAccount();
        this.transporter = nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass
          }
        });
        console.log('Email service initialized with Ethereal Email (testing mode)');
        console.log('Test account:', testAccount.user);
      }
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize email service:', error);
      // Fallback to a basic configuration
      this.transporter = nodemailer.createTransport({
        streamTransport: true,
        newline: 'unix',
        buffer: true
      });
    }
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    try {
      // Ensure transporter is initialized
      if (!this.isInitialized) {
        await this.initializeTransporter();
      }

      // Use provided HTML or convert plain text to HTML if needed
      const htmlContent = options.html || this.textToHtml(options.text);
      
      // Get FROM address from config file if available
      let fromAddress = process.env.EMAIL_FROM || '"WMK Installation Team" <noreply@wmk-crm.com>';
      
      try {
        const fs = await import('fs/promises');
        const path = await import('path');
        const configPath = path.join(process.cwd(), 'server', 'config', 'smtp-config.json');
        const configData = await fs.readFile(configPath, 'utf8');
        const smtpConfig = JSON.parse(configData);
        if (smtpConfig.isActive && smtpConfig.from) {
          fromAddress = `"${smtpConfig.from.name}" <${smtpConfig.from.email}>`;
        }
      } catch (error) {
        // Config file not found, use default
      }
      
      const mailOptions = {
        from: fromAddress,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: htmlContent
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', info.messageId);
      
      // For Ethereal Email, log the preview URL
      const isUsingRealSMTP = await this.isUsingRealSMTP();
      if (!isUsingRealSMTP) {
        const previewUrl = nodemailer.getTestMessageUrl(info);
        if (previewUrl) {
          console.log('📧 Email preview URL:', previewUrl);
        }
      }
    } catch (error) {
      console.error('Failed to send email:', error);
      throw new Error('Failed to send email notification');
    }
  }

  private textToHtml(text: string): string {
    // Convert professional plain text to styled HTML
    return text
      // Convert headers with box borders
      .replace(/┌─+┐\n│\s*(.*?)\s*│\n└─+┘/g, '<div style="background:#f8f9fa;border:2px solid #dee2e6;border-radius:8px;padding:12px;margin:16px 0;text-align:center;"><h3 style="margin:0;color:#495057;font-size:14px;font-weight:bold;text-transform:uppercase;letter-spacing:1px;">$1</h3></div>')
      
      // Convert checkboxes
      .replace(/□\s*(.*?)$/gm, '<div style="margin:4px 0;"><span style="color:#6c757d;">☐</span> $1</div>')
      .replace(/✓\s*(.*?)$/gm, '<div style="margin:4px 0;color:#28a745;"><span style="font-weight:bold;">✓</span> $1</div>')
      
      // Convert status indicators
      .replace(/✅\s*(.*?)$/gm, '<span style="color:#28a745;font-weight:bold;">✅ $1</span>')
      .replace(/⚠️\s*(.*?)$/gm, '<span style="color:#fd7e14;font-weight:bold;">⚠️ $1</span>')
      
      // Convert bullet points with icons
      .replace(/•\s*(.*?)$/gm, '<div style="margin:4px 0;"><span style="color:#007bff;">•</span> $1</div>')
      
      // Convert contact info
      .replace(/📞\s*(.*?)$/gm, '<div style="margin:4px 0;"><span style="color:#17a2b8;">📞</span> $1</div>')
      .replace(/📧\s*(.*?)$/gm, '<div style="margin:4px 0;"><span style="color:#17a2b8;">📧</span> $1</div>')
      .replace(/🌐\s*(.*?)$/gm, '<div style="margin:4px 0;"><span style="color:#17a2b8;">🌐</span> $1</div>')
      .replace(/📅\s*(.*?)$/gm, '<div style="margin:8px 0;"><span style="color:#007bff;font-weight:bold;">📅</span> $1</div>')
      .replace(/👤\s*(.*?)$/gm, '<div style="margin:8px 0;"><span style="color:#6f42c1;font-weight:bold;">👤</span> $1</div>')
      .replace(/🔧\s*(.*?)$/gm, '<div style="margin:8px 0;"><span style="color:#fd7e14;font-weight:bold;">🔧</span> $1</div>')
      .replace(/💰\s*(.*?)$/gm, '<div style="margin:8px 0;"><span style="color:#28a745;font-weight:bold;">💰</span> $1</div>')
      
      // Convert double line breaks to paragraphs
      .replace(/\n\n/g, '</p><p style="margin:12px 0;line-height:1.5;">')
      
      // Convert single line breaks to br tags
      .replace(/\n/g, '<br>')
      
      // Wrap in paragraphs
      .replace(/^/, '<div style="font-family:Arial,sans-serif;font-size:14px;line-height:1.6;color:#333;"><p style="margin:12px 0;line-height:1.5;">')
      .replace(/$/, '</p></div>')
      
      // Bold text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      
      // Style company signature
      .replace(/(Quality • Craftsmanship • Excellence|Excellence in Every Installation)/, '<div style="margin-top:20px;padding:12px;background:#f8f9fa;border-left:4px solid #007bff;font-style:italic;color:#6c757d;text-align:center;">$1</div>');
  }

  async testConnection(): Promise<boolean> {
    try {
      if (!this.isInitialized) {
        await this.initializeTransporter();
      }
      await this.transporter.verify();
      console.log('SMTP connection verified successfully');
      return true;
    } catch (error) {
      console.error('SMTP connection failed:', error);
      return false;
    }
  }

  private async isUsingRealSMTP(): Promise<boolean> {
    try {
      const fs = await import('fs/promises');
      const path = await import('path');
      const configPath = path.join(process.cwd(), 'server', 'config', 'smtp-config.json');
      const configData = await fs.readFile(configPath, 'utf8');
      const smtpConfig = JSON.parse(configData);
      return smtpConfig.isActive;
    } catch (error) {
      return !!(process.env.EMAIL_USER && process.env.EMAIL_PASS);
    }
  }
}

export const emailService = new EmailService();
