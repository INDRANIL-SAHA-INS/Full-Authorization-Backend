import Usermodel from '../Models/user-model.js';
import { z } from 'zod';
import { generateVerificationCode } from '../util/generateverificationcode.js';
import bcrypt from 'bcryptjs';
import { generateTokenAndSetCookie } from '../util/generate-token-and-set-cookie.js';
import { sendVerificationEmail, sendWelcomeEmail } from '../mailtrap/mailtrap-config.js';

// Zod schemas
const signupSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6)
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

//this function handles user signup
export const signup = async (req, res) => {
  // Validate input
  const parse = signupSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ message: 'Invalid input', errors: parse.error.errors });
  }
  const { name, email, password } = parse.data;

  try {
    // Check if user exists
    const existingUser = await Usermodel.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    // Generate verification token
    const verificationToken = generateVerificationCode(6);

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    // Set verification token expiration (e.g., 1 hour from now)
    const verificationTokenExpiresAt = new Date(Date.now() + 60 * 60 * 1000);
    // Create user with hashed password
    const user = new Usermodel({ name, email, password: hashedPassword, verificationToken, verificationExpiresAt: verificationTokenExpiresAt });
    // Save user to database
    await user.save();

    // Send verification email
    await sendVerificationEmail(user.email, verificationToken);

    // Generate JWT and set cookie
    generateTokenAndSetCookie(res, user._id);

    res.status(201).json({ message: 'Signup successful', user: { name: user.name, email: user.email }, verificationToken });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};


//this function handles user login

export const login = async (req, res) => {
  // Validate input
  const parse = loginSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ message: 'Invalid input', errors: parse.error.errors });
  }
  const { email, password } = parse.data;

  try {
    // Find user
    const user = await Usermodel.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Compare password with hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Update lastlogin
    user.lastlogin = new Date();
    await user.save();

    // Generate JWT and set cookie
    generateTokenAndSetCookie(res, user._id);

    res.json({
      message: 'Login successful',
      user: {
        name: user.name,
        email: user.email,
        lastlogin: user.lastlogin
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

//this function handles user logout
export const logout = (req, res) => {
  // Clear the token cookie
  res.clearCookie('token');
  res.json({ message: 'Logout successful' });
};


//this function handles email verification
export const verifyEmail = async (req, res) => {
  const { email, verificationToken } = req.body;

  try {
    // Find user by email and verificationToken
    const user = await Usermodel.findOne({ email, verificationToken });

    // If user not found or token doesn't match
    if (!user) {
      return res.status(400).json({ message: 'Invalid verification code or email.' });
    }

    // Check if token is expired
    if (!user.verificationExpiresAt || user.verificationExpiresAt < new Date()) {
      return res.status(400).json({ message: 'Verification code has expired.' });
    }

    // Mark user as verified
    user.isverified = true;
    user.verificationToken = undefined;
    user.verificationExpiresAt = undefined;
    await user.save();

    // Send welcome email
    await sendWelcomeEmail(user.email, user.name);

    res.json({ message: 'Email verified successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

//this function checks if the user is authenticated

export const checkauth = async (req, res) => {
  // Check if user is authenticated
  if (!req.userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    // Find user by ID
    const user = await Usermodel.findById(req.userId, 'name email lastlogin isverified');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({
      message: 'User is authenticated',
      user: {
        name: user.name,
        email: user.email,
        lastlogin: user.lastlogin,
        isverified: user.isverified
      }
    });
  }
  catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};