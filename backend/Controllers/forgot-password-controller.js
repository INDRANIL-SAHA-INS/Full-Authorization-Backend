import Usermodel from '../Models/user-model.js';
import { sendPasswordResetEmail } from '../mailtrap/mailtrap-config.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { z } from 'zod';
import dotenv from 'dotenv';
dotenv.config();

// Zod schema for forgot password
const forgotPasswordSchema = z.object({
  email: z.string().email()
});

export const forgotPassword = async (req, res) => {
  // Validate input
  const parse = forgotPasswordSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ message: 'Invalid input', errors: parse.error.errors });
  }
  const { email } = parse.data;

  try {
    // Find user by email
    const user = await Usermodel.findOne({ email });
    if (!user) {
      // Do not reveal if user exists for security
      return res.json({ message: 'If an account with that email exists, a reset link has been sent.' });
    }

    // Generate a reset token and expiry (15 minutes)
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetpasswordExpiresAt = new Date(Date.now() + 60 * 60 * 1000);

    // Save token and expiry to user
    user.resetpasswordToken = resetToken;
    user.resetpasswordExpiresAt = resetpasswordExpiresAt;
    await user.save();

    // Create a reset link (
    // only send token, not email)
    const CLIENT_URL = process.env.CLIENT_URL;
    const resetLink = `${CLIENT_URL}/reset-password?token=${resetToken}`;

    // Send the password reset email
    await sendPasswordResetEmail(email, resetLink);

    // Always send a generic response
    res.json({ message: 'If an account with that email exists, a reset link has been sent.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

