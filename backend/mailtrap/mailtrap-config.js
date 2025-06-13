import nodemailer from "nodemailer";
import { VERIFICATION_EMAIL_TEMPLATE, PASSWORD_RESET_REQUEST_TEMPLATE, PASSWORD_RESET_SUCCESS_TEMPLATE } from './email-tamplate.js';

// Helper to inject the code into the template
function getVerificationEmailHtml(verificationCode) {
  return VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", verificationCode);
}

// Create the transporter
const transport = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "cda2a7f89b0a16",
    pass: "0c8aa7b504bbe4"
  }
});

// Function to send a verification email
export async function sendVerificationEmail(to, verificationCode) {
  try {
    const html = getVerificationEmailHtml(verificationCode); // full HTML with code inserted
    const info = await transport.sendMail({
      from: '"Mailtrap Test" <hello@example.com>',
      to,
      subject: "Verify your email address",
      text: `Your verification code is: ${verificationCode}`,
      html // send the full HTML template
    });
    console.log("Verification email sent: %s", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw error;
  }
}

// Function to send a welcome email
export async function sendWelcomeEmail(to, username) {
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Welcome to Our App!</title>
    </head>
    <body style="font-family: Arial, sans-serif; background: #f9f9f9; padding: 30px;">
      <div style="max-width: 600px; margin: auto; background: #fff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.07); padding: 30px;">
        <h2 style="color: #4CAF50;">Welcome, ${username}!</h2>
        <p>Thank you for verifying your email and joining our community.</p>
        <p>We're excited to have you on board. If you have any questions or need help, feel free to reply to this email.</p>
        <p style="margin-top: 40px;">Best regards,<br>Your App Team</p>
      </div>
      <div style="text-align: center; color: #aaa; font-size: 0.9em; margin-top: 20px;">
        <p>This is an automated message, please do not reply.</p>
      </div>
    </body>
    </html>
  `;

  try {
    const info = await transport.sendMail({
      from: '"Mailtrap Test" <hello@example.com>',
      to,
      subject: "Welcome to Our App!",
      html
    });
    console.log("Welcome email sent: %s", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending welcome email:", error);
    throw error;
  }
}

// Function to send a password reset email
export async function sendPasswordResetEmail(to, resetLink) {
  const html = PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetLink);

  try {
    const info = await transport.sendMail({
      from: '"Mailtrap Test" <hello@example.com>',
      to,
      subject: "Password Reset Request",
      text: `Click the following link to reset your password: ${resetLink}`,
      html
    });
    console.log("Password reset email sent: %s", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw error;
  }
}

// Function to send password reset success email
export async function sendPasswordResetSuccessEmail(to) {
  try {
    const html = PASSWORD_RESET_SUCCESS_TEMPLATE;
    const info = await transport.sendMail({
      from: '"Mailtrap Test" <hello@example.com>',
      to,
      subject: "Your password has been reset successfully",
      text: "Your password has been reset successfully. If you did not perform this action, please contact support immediately.",
      html
    });
    console.log("Password reset success email sent: %s", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending password reset success email:", error);
    throw error;
  }
}