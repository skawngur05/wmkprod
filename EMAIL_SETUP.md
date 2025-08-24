# Email Notifications for Installations

## Overview
The WMK CRM now includes email notification functionality for installations. This allows you to automatically send professional email notifications to both clients and installers about upcoming installations.

## Features
- ✅ Client email notifications with installation details
- ✅ Installer email notifications with job details
- ✅ Custom message support
- ✅ Professional email templates
- ✅ SMTP support for real email delivery
- ✅ Test mode with Ethereal Email for development

## How to Use

### 1. From the Installations Page
1. Navigate to the **Installations** page
2. Find the installation you want to send notifications for
3. Click the **"Send Email"** button for that installation
4. Choose the email type:
   - **Client Email**: Sends confirmation to the customer
   - **Installer Email**: Sends job assignment to the installer
5. Optionally add a custom message
6. Click **"Send Email"**

### 2. Email Templates

#### Client Email includes:
- Installation date and time
- Customer details
- Project value
- Assigned installer
- What to expect during installation
- Contact information

#### Installer Email includes:
- Job assignment details
- Customer contact information
- Project value
- Payment status (deposit/balance)
- Installation notes
- Instructions to contact customer 24h before

## Email Configuration

### Development Mode (Default)
- Uses **Ethereal Email** for testing
- Emails are not actually delivered
- Preview URLs are shown in the console
- No configuration required

### Production Mode (Real Email Delivery)
To send real emails, configure your `.env` file:

```bash
# Gmail Configuration (recommended)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM="WMK Installation Team <your-email@gmail.com>"

# Optional SMTP settings (defaults to Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
```

### Gmail Setup Instructions
1. Enable 2-Factor Authentication on your Gmail account
2. Generate an **App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
3. Use this app password (not your regular password) in `EMAIL_PASS`

### Other Email Providers

#### Outlook/Hotmail
```bash
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
EMAIL_USER=your-email@outlook.com
EMAIL_PASS=your-password
```

#### Custom SMTP
```bash
SMTP_HOST=your-smtp-server.com
SMTP_PORT=587
EMAIL_USER=your-smtp-username
EMAIL_PASS=your-smtp-password
```

## Testing

### Test with Ethereal Email
1. Keep `.env` file without EMAIL_USER and EMAIL_PASS
2. Send test emails from the installations page
3. Check console for preview URLs like:
   ```
   📧 Email preview URL: https://ethereal.email/message/xxx
   ```
4. Open the preview URL to see how the email looks

### Test with Real Email
1. Configure your email settings in `.env`
2. Restart the server: `npm run dev`
3. Send a test email to yourself first
4. Check spam folder if emails don't appear in inbox

## Troubleshooting

### "Failed to send email notification"
- Check your email credentials in `.env`
- Verify SMTP settings for your provider
- Check console for detailed error messages
- Ensure your email provider allows SMTP access

### Gmail "Invalid credentials"
- Make sure you're using an **App Password**, not your regular password
- Verify 2-Factor Authentication is enabled
- Check that the app password is correctly copied

### Emails going to spam
- Configure SPF/DKIM records for your domain (advanced)
- Use a professional "from" address
- Avoid spam trigger words in email content
- Consider using dedicated email services like SendGrid or Mailgun for production

## Future Enhancements
- [ ] Email templates customization
- [ ] Scheduled email reminders
- [ ] Email delivery status tracking
- [ ] Integration with calendar systems
- [ ] SMS notifications
- [ ] Multiple installer email support
