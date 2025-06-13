import Usermodel from '../Models/user-model.js';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

// Zod schema for new password validation
const resetPasswordSchema = z.object({
  password: z.string().min(6)
});

export const resetPassword = async (req, res) => {
  const { token } = req.query;
  const parse = resetPasswordSchema.safeParse(req.body);

  if (!token) {
    return res.status(400).json({ message: 'Reset token is required.' });
  }
  if (!parse.success) {
    return res.status(400).json({ message: 'Invalid password.', errors: parse.error.errors });
  }
  const { password } = parse.data;

  try {
    // Find user by reset token and check if token is still valid
    const user = await Usermodel.findOne({
      resetpasswordToken: token,
      resetpasswordExpiresAt: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token.' });
    }

    // Hash the new password and update user
    user.password = await bcrypt.hash(password, 10);
    user.resetpasswordToken = undefined;
    user.resetpasswordExpiresAt = undefined;
    await user.save();

    res.json({ message: 'Password has been reset successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};