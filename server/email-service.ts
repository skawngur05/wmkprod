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

  async sendTrackingNotification(
    customerEmail: string,
    customerName: string,
    orderNumber: string,
    trackingNumber: string
  ): Promise<boolean> {
    try {
      const subject = `Your Wrap My Kitchen Order Has Shipped! - Order #${orderNumber}`;
      const trackingUrl = `https://tools.usps.com/go/TrackConfirmAction?tRef=fullpage&tLc=2&text28777=&tLabels=${encodeURIComponent(trackingNumber)}`;
      
      const text = `
WRAP MY KITCHEN - Kitchen Transformation Specialists

🚚 YOUR ORDER HAS BEEN SHIPPED!

Great news! Your Wrap My Kitchen order has been processed and shipped. We're excited for you to start your kitchen transformation journey.

ORDER #${orderNumber}
Shipped on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}

PRODUCT DETAILS:
- Sample Booklet
- Premium Collection
- Quantity: 1

📦 TRACK YOUR SHIPMENT:
Your package is on its way! Use the tracking number below to monitor your shipment's progress.

Tracking Number: ${trackingNumber}
Track your package: ${trackingUrl}

Estimated delivery: 2-5 business days via USPS

CUSTOMER INFORMATION:
${customerName}
${customerEmail}

💡 PRO TIP: Take before photos of your kitchen to see the amazing transformation after installation!

WRAP MY KITCHEN SUPPORT:
Questions about your order? We're here to help!
📞 Phone: Contact us for assistance
📧 Email: Contact us for support
🌐 Website: Visit our support center

© 2025 Wrap My Kitchen USA. All rights reserved.
You received this email because you placed an order with us.
      `;

      const html = `
<html>
<head>
    <style>
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.6; 
            color: #2c3e50; 
            margin: 0; 
            padding: 0;
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            min-height: 100vh;
        }
        .email-wrapper {
            padding: 40px 20px;
        }
        .container { 
            max-width: 650px; 
            margin: 0 auto; 
            background-color: white;
            border-radius: 12px;
            box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .logo-header { 
            text-align: center;
            padding: 40px 30px 30px;
            background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
            border-bottom: 1px solid #e9ecef;
        }
        .logo-header h1 {
            margin: 0;
            font-size: 42px;
            font-weight: 700;
            color: #2c3e50;
            letter-spacing: -1px;
        }
        .logo-header .kitchen {
            color: #28a745;
            font-weight: 800;
        }
        .logo-header .tagline {
            margin: 8px 0 0;
            font-size: 14px;
            color: #6c757d;
            font-weight: 500;
            letter-spacing: 0.5px;
            text-transform: uppercase;
        }
        .green-banner { 
            background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
            color: white; 
            padding: 25px 30px; 
            text-align: center;
            font-size: 20px;
            font-weight: 600;
            box-shadow: inset 0 -2px 4px rgba(0, 0, 0, 0.1);
        }
        .content { 
            padding: 40px 30px;
        }
        .notification-text {
            font-size: 16px;
            color: #495057;
            margin-bottom: 25px;
            line-height: 1.7;
        }
        .order-header {
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            padding: 20px;
            border-radius: 8px;
            margin: 25px 0;
            border-left: 4px solid #28a745;
        }
        .order-header h3 {
            margin: 0 0 5px;
            color: #2c3e50;
            font-size: 18px;
            font-weight: 600;
        }
        .order-header .order-date {
            color: #6c757d;
            font-size: 14px;
        }
        .order-table {
            width: 100%;
            border-collapse: collapse;
            margin: 25px 0;
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
        }
        .order-table thead tr {
            background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
            color: white;
        }
        .order-table th,
        .order-table td {
            padding: 15px 18px;
            text-align: left;
            border-bottom: 1px solid #f1f3f4;
        }
        .order-table th {
            font-weight: 600;
            font-size: 14px;
            letter-spacing: 0.5px;
            text-transform: uppercase;
        }
        .order-table td {
            color: #495057;
        }
        .order-table td:last-child,
        .order-table th:last-child {
            text-align: right;
        }
        .tracking-section {
            background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
            color: white;
            border-radius: 12px;
            padding: 30px;
            text-align: center;
            margin: 30px 0;
            box-shadow: 0 8px 25px rgba(40, 167, 69, 0.25);
        }
        .tracking-section h3 {
            margin: 0 0 15px;
            font-size: 20px;
            font-weight: 600;
        }
        .tracking-number { 
            font-size: 24px; 
            font-weight: 700; 
            background-color: rgba(255, 255, 255, 0.15);
            backdrop-filter: blur(10px);
            padding: 15px 25px;
            border-radius: 8px;
            margin: 20px 0;
            letter-spacing: 2px;
            border: 2px solid rgba(255, 255, 255, 0.3);
        }
        .button { 
            display: inline-block; 
            background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
            color: #28a745; 
            padding: 15px 35px; 
            text-decoration: none; 
            font-weight: 600;
            margin: 20px 0;
            border-radius: 8px;
            border: 2px solid rgba(255, 255, 255, 0.3);
            transition: all 0.3s ease;
            font-size: 16px;
            box-shadow: 0 4px 15px rgba(255, 255, 255, 0.2);
        }
        .button:hover {
            background: white;
            color: #28a745;
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(255, 255, 255, 0.3);
        }
        .address-section {
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            padding: 25px;
            border-radius: 12px;
            border-left: 4px solid #28a745;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
            margin: 30px 0;
        }
        .address-section h3 {
            color: #2c3e50;
            margin: 0 0 15px;
            font-size: 16px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .address-section p {
            margin: 5px 0;
            line-height: 1.5;
            color: #495057;
        }
        .address-section a {
            color: #28a745;
            text-decoration: none;
            font-weight: 500;
        }
        .app-section {
            background: linear-gradient(135deg, #343a40 0%, #495057 100%);
            color: white;
            padding: 25px;
            border-radius: 12px;
            text-align: center;
            margin: 30px 0;
        }
        .app-section a {
            color: #28a745;
            font-weight: 600;
            text-decoration: none;
        }
        .footer { 
            background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
            color: #ecf0f1;
            text-align: center; 
            padding: 35px 30px;
        }
        .footer h4 {
            margin: 0 0 15px;
            color: white;
            font-size: 18px;
            font-weight: 600;
        }
        .footer p {
            margin: 8px 0;
            opacity: 0.9;
        }
        .footer a {
            color: #28a745;
            text-decoration: none;
            font-weight: 500;
        }
        @media (max-width: 650px) {
            .email-wrapper {
                padding: 20px 10px;
            }
            .container {
                border-radius: 0;
            }
            .logo-header {
                padding: 30px 20px 20px;
            }
            .logo-header h1 {
                font-size: 32px;
            }
            .content {
                padding: 30px 20px;
            }
            .order-table th,
            .order-table td {
                padding: 12px 8px;
                font-size: 14px;
            }
        }
    </style>
</head>
<body>
    <div class="email-wrapper">
        <div class="container">
            <div class="logo-header">
                <h1>WrapMy<span class="kitchen">Kitchen</span></h1>
                <div class="tagline">Kitchen Transformation Specialists</div>
            </div>
            
            <div class="green-banner">
                📦 Your Order Has Been Shipped!
            </div>
            
            <div class="content">
                <div class="notification-text">
                    Great news! Your order has been processed and shipped. We're excited for you to start your kitchen transformation journey.
                </div>
                
                <div class="order-header">
                    <h3>Order #${orderNumber}</h3>
                    <div class="order-date">Shipped on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                </div>
                
                <table class="order-table">
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Description</th>
                            <th>Quantity</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><strong>Sample Booklet</strong></td>
                            <td>Premium Collection</td>
                            <td>1</td>
                        </tr>
                    </tbody>
                </table>
                
                <div class="tracking-section">
                    <h3>📦 Track Your Shipment</h3>
                    <p>Your package is on its way! Use the tracking number below to monitor your shipment's progress.</p>
                    <div class="tracking-number">${trackingNumber}</div>
                    <a href="${trackingUrl}" class="button" target="_blank">🔍 Track Package</a>
                    <p style="margin: 15px 0 0; font-size: 14px; opacity: 0.9;">
                        Estimated delivery: 2-5 business days via USPS
                    </p>
                </div>
                
                <div class="address-section">
                    <h3>Customer Information</h3>
                    <p><strong>${customerName}</strong></p>
                    <p><a href="mailto:${customerEmail}">${customerEmail}</a></p>
                </div>
                
                <div class="app-section">
                    <p>💡 <strong>Pro Tip:</strong> Take before photos of your kitchen to see the amazing transformation after installation!</p>
                </div>
            </div>
            
            <div class="footer">
                <h4>Wrap My Kitchen Support</h4>
                <p>Questions about your order? We're here to help!</p>
                <p><strong>📞 Phone:</strong> Contact us for assistance</p>
                <p><strong>📧 Email:</strong> <a href="mailto:info@wrapmykitchen.com">info@wrapmykitchen.com</a></p>
                <p><strong>🌐 Website:</strong> <a href="https://wrapmykitchen.com">wrapmykitchen.com</a></p>
                <p style="margin-top: 20px; font-size: 13px; opacity: 0.8;">
                    © 2025 Wrap My Kitchen USA. All rights reserved.<br>
                    You received this email because you placed an order with us.
                </p>
            </div>
        </div>
    </div>
</body>
</html>
      `;

      await this.sendEmail({
        to: customerEmail,
        subject,
        text,
        html
      });

      return true;
    } catch (error) {
      console.error('Failed to send tracking notification:', error);
      return false;
    }
  }

  async sendShippedNotification(
    customerEmail: string,
    customerName: string,
    orderNumber: string,
    trackingNumber?: string
  ): Promise<boolean> {
    try {
      const subject = `Your Wrap My Kitchen Order Has Shipped! - Order #${orderNumber}`;
      const trackingUrl = trackingNumber 
        ? `https://tools.usps.com/go/TrackConfirmAction?tRef=fullpage&tLc=2&text28777=&tLabels=${encodeURIComponent(trackingNumber)}`
        : '';
      
      const trackingInfo = trackingNumber 
        ? `
TRACKING INFORMATION:
Your package is on its way! Use the tracking number below to monitor your shipment's progress.

Tracking Number: ${trackingNumber}
Track your package: ${trackingUrl}

Estimated delivery: 2-5 business days via USPS
`
        : 'Tracking information will be provided separately once available.\n';
      
      const text = `
WRAP MY KITCHEN - Kitchen Transformation Specialists

🚚 YOUR ORDER HAS BEEN SHIPPED!

Great news! Your Wrap My Kitchen order has been processed and shipped. We're excited for you to start your kitchen transformation journey.

ORDER #${orderNumber}
Shipped on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}

PRODUCT DETAILS:
- Sample Booklet
- Premium Collection
- Quantity: 1

${trackingInfo}

CUSTOMER INFORMATION:
${customerName}
${customerEmail}

💡 PRO TIP: Take before photos of your kitchen to see the amazing transformation after installation!

WRAP MY KITCHEN SUPPORT:
Questions about your order? We're here to help!
📞 Phone: Contact us for assistance
📧 Email: Contact us for support
🌐 Website: Visit our support center

© 2025 Wrap My Kitchen USA. All rights reserved.
You received this email because you placed an order with us.
      `;

      const trackingSection = trackingNumber 
        ? `
          <div class="tracking-section">
            <h3>📦 Track Your Shipment</h3>
            <p>Your package is on its way! Use the tracking number below to monitor your shipment's progress.</p>
            <div class="tracking-number">${trackingNumber}</div>
            <a href="${trackingUrl}" class="button" target="_blank">🔍 Track Package</a>
            <p style="margin: 15px 0 0; font-size: 14px; opacity: 0.9;">
              Estimated delivery: 2-5 business days via USPS
            </p>
          </div>
        `
        : `
          <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; border-radius: 8px; margin: 30px 0;">
            <h3 style="color: #856404; margin: 0 0 10px; font-size: 18px;">📋 Tracking Information</h3>
            <p style="margin: 0; font-size: 14px; color: #856404;">
              We'll send you tracking details separately once they become available.
            </p>
          </div>
        `;

      const html = `
<html>
<head>
    <style>
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.6; 
            color: #2c3e50; 
            margin: 0; 
            padding: 0;
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            min-height: 100vh;
        }
        .email-wrapper {
            padding: 40px 20px;
        }
        .container { 
            max-width: 650px; 
            margin: 0 auto; 
            background-color: white;
            border-radius: 12px;
            box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .logo-header { 
            text-align: center;
            padding: 40px 30px 30px;
            background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
            border-bottom: 1px solid #e9ecef;
        }
        .logo-header h1 {
            margin: 0;
            font-size: 42px;
            font-weight: 700;
            color: #2c3e50;
            letter-spacing: -1px;
        }
        .logo-header .kitchen {
            color: #28a745;
            font-weight: 800;
        }
        .logo-header .tagline {
            margin: 8px 0 0;
            font-size: 14px;
            color: #6c757d;
            font-weight: 500;
            letter-spacing: 0.5px;
            text-transform: uppercase;
        }
        .green-banner { 
            background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
            color: white; 
            padding: 25px 30px; 
            text-align: center;
            font-size: 20px;
            font-weight: 600;
            box-shadow: inset 0 -2px 4px rgba(0, 0, 0, 0.1);
        }
        .content { 
            padding: 40px 30px;
        }
        .notification-text {
            font-size: 16px;
            color: #495057;
            margin-bottom: 25px;
            line-height: 1.7;
        }
        .order-header {
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            padding: 20px;
            border-radius: 8px;
            margin: 25px 0;
            border-left: 4px solid #28a745;
        }
        .order-header h3 {
            margin: 0 0 5px;
            color: #2c3e50;
            font-size: 18px;
            font-weight: 600;
        }
        .order-header .order-date {
            color: #6c757d;
            font-size: 14px;
        }
        .order-table {
            width: 100%;
            border-collapse: collapse;
            margin: 25px 0;
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
        }
        .order-table thead tr {
            background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
            color: white;
        }
        .order-table th,
        .order-table td {
            padding: 15px 18px;
            text-align: left;
            border-bottom: 1px solid #f1f3f4;
        }
        .order-table th {
            font-weight: 600;
            font-size: 14px;
            letter-spacing: 0.5px;
            text-transform: uppercase;
        }
        .order-table td {
            color: #495057;
        }
        .order-table td:last-child,
        .order-table th:last-child {
            text-align: right;
        }
        .tracking-section {
            background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
            color: white;
            border-radius: 12px;
            padding: 30px;
            text-align: center;
            margin: 30px 0;
            box-shadow: 0 8px 25px rgba(40, 167, 69, 0.25);
        }
        .tracking-section h3 {
            margin: 0 0 15px;
            font-size: 20px;
            font-weight: 600;
        }
        .tracking-number { 
            font-size: 24px; 
            font-weight: 700; 
            background-color: rgba(255, 255, 255, 0.15);
            backdrop-filter: blur(10px);
            padding: 15px 25px;
            border-radius: 8px;
            margin: 20px 0;
            letter-spacing: 2px;
            border: 2px solid rgba(255, 255, 255, 0.3);
        }
        .button { 
            display: inline-block; 
            background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
            color: #28a745; 
            padding: 15px 35px; 
            text-decoration: none; 
            font-weight: 600;
            margin: 20px 0;
            border-radius: 8px;
            border: 2px solid rgba(255, 255, 255, 0.3);
            transition: all 0.3s ease;
            font-size: 16px;
            box-shadow: 0 4px 15px rgba(255, 255, 255, 0.2);
        }
        .address-section {
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            padding: 25px;
            border-radius: 12px;
            border-left: 4px solid #28a745;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
            margin: 30px 0;
        }
        .address-section h3 {
            color: #2c3e50;
            margin: 0 0 15px;
            font-size: 16px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .address-section p {
            margin: 5px 0;
            line-height: 1.5;
            color: #495057;
        }
        .address-section a {
            color: #28a745;
            text-decoration: none;
            font-weight: 500;
        }
        .app-section {
            background: linear-gradient(135deg, #343a40 0%, #495057 100%);
            color: white;
            padding: 25px;
            border-radius: 12px;
            text-align: center;
            margin: 30px 0;
        }
        .footer { 
            background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
            color: #ecf0f1;
            text-align: center; 
            padding: 35px 30px;
        }
        .footer h4 {
            margin: 0 0 15px;
            color: white;
            font-size: 18px;
            font-weight: 600;
        }
        .footer p {
            margin: 8px 0;
            opacity: 0.9;
        }
        .footer a {
            color: #28a745;
            text-decoration: none;
            font-weight: 500;
        }
        @media (max-width: 650px) {
            .email-wrapper { padding: 20px 10px; }
            .container { border-radius: 0; }
            .logo-header { padding: 30px 20px 20px; }
            .logo-header h1 { font-size: 32px; }
            .content { padding: 30px 20px; }
        }
    </style>
</head>
<body>
    <div class="email-wrapper">
        <div class="container">
            <div class="logo-header">
                <h1>WrapMy<span class="kitchen">Kitchen</span></h1>
                <div class="tagline">Kitchen Transformation Specialists</div>
            </div>
            
            <div class="green-banner">
                📦 Your Order Has Been Shipped!
            </div>
            
            <div class="content">
                <div class="notification-text">
                    Great news! Your order has been processed and shipped. We're excited for you to start your kitchen transformation journey.
                </div>
                
                <div class="order-header">
                    <h3>Order #${orderNumber}</h3>
                    <div class="order-date">Shipped on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                </div>
                
                <table class="order-table">
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Description</th>
                            <th>Quantity</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><strong>Sample Booklet</strong></td>
                            <td>Premium Collection</td>
                            <td>1</td>
                        </tr>
                    </tbody>
                </table>
                
                ${trackingSection}
                
                <div class="address-section">
                    <h3>Customer Information</h3>
                    <p><strong>${customerName}</strong></p>
                    <p><a href="mailto:${customerEmail}">${customerEmail}</a></p>
                </div>
                
                <div class="app-section">
                    <p>💡 <strong>Pro Tip:</strong> Take before photos of your kitchen to see the amazing transformation after installation!</p>
                </div>
            </div>
            
            <div class="footer">
                <h4>Wrap My Kitchen Support</h4>
                <p>Questions about your order? We're here to help!</p>
                <p><strong>📞 Phone:</strong> Contact us for assistance</p>
                <p><strong>📧 Email:</strong> <a href="mailto:support@wrapmykitchen.com">support@wrapmykitchen.com</a></p>
                <p><strong>🌐 Website:</strong> <a href="https://wrapmykitchen.com">wrapmykitchen.com</a></p>
                <p style="margin-top: 20px; font-size: 13px; opacity: 0.8;">
                    © 2025 Wrap My Kitchen USA. All rights reserved.<br>
                    You received this email because you placed an order with us.
                </p>
            </div>
        </div>
    </div>
</body>
</html>
      `;

      await this.sendEmail({
        to: customerEmail,
        subject,
        text,
        html
      });

      return true;
    } catch (error) {
      console.error('Failed to send shipped notification:', error);
      return false;
    }
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
