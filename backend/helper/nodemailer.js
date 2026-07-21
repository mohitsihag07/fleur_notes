const nodemailer = require('nodemailer');

/**
 * Utility function to send email via SMTP, with a console logger fallback for local development.
 * @param {Object} options - Email sending options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plain text email content
 * @param {string} options.html - HTML email content
 */
const sendEmail = async ({ to, subject, text, html }) => {
  try {
    // If SMTP credentials are not present, log email details to console (Development Fallback)
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log('\n=========================================');
      console.log(`📧 DEVELOPMENT EMAIL FALLBACK`);
      console.log(`To:      ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(`Message: ${text}`);
      console.log('=========================================\n');
      return true;
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || '"Fleur Notes" <no-reply@fleur.com>',
      to,
      subject,
      text,
      html,
    });

    console.log(`Email sent successfully: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    // Log to console anyway as a fallback during failures
    console.log('\n=========================================');
    console.log(`📧 FALLBACK (AFTER SMTP ERROR)`);
    console.log(`To:      ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Message: ${text}`);
    console.log('=========================================\n');
    return false;
  }
};

module.exports = {
  sendEmail,
};
