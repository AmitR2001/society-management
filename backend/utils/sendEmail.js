const nodemailer = require('nodemailer');
const axios = require('axios');

// Brevo API configuration (recommended for cloud hosting)
const brevoApiKey = process.env.BREVO_API_KEY;

// Fallback: SMTP configuration
const hasSmtpConfig =
  process.env.SMTP_HOST &&
  process.env.SMTP_PORT &&
  process.env.SMTP_USER &&
  process.env.SMTP_PASS;

const transporter = hasSmtpConfig
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000
    })
  : null;

const sendEmail = async ({ to, subject, html }) => {
  const senderEmail = process.env.MAIL_FROM_EMAIL || process.env.SMTP_USER || 'noreply@example.com';
  const senderName = process.env.MAIL_FROM_NAME || 'Society Management';

  // Try Brevo API first (works best on cloud platforms)
  if (brevoApiKey) {
    try {
      const response = await axios.post(
        'https://api.brevo.com/v3/smtp/email',
        {
          sender: { name: senderName, email: senderEmail },
          to: [{ email: to }],
          subject,
          htmlContent: html
        },
        {
          headers: {
            'api-key': brevoApiKey,
            'Content-Type': 'application/json'
          },
          timeout: 15000
        }
      );
      console.log(`Email sent via Brevo API to ${to}`);
      return true;
    } catch (err) {
      console.error('Brevo API failed:', err.response?.data || err.message);
    }
  }

  // Fallback to SMTP
  if (transporter) {
    try {
      await transporter.sendMail({
        from: `${senderName} <${senderEmail}>`,
        to,
        subject,
        html
      });
      console.log(`Email sent via SMTP to ${to}`);
      return true;
    } catch (err) {
      console.error('SMTP failed:', err.message);
    }
  }

  return false;
};

module.exports = sendEmail;
