import express from 'express';
import {
  signup,
  login,
  logout,
  verifyEmail,
  checkauth

} from '../Controllers/auth-controller.js';

import { verifyToken } from '../middleware/verifyToken.js';
import { resetPassword } from '../Controllers/reset-password-controller.js';
import {forgotPassword} from '../Controllers/forgot-password-controller.js';

const router = express.Router();

//check authentication
router.get('/check-auth',verifyToken,checkauth);
// Signup (register new user)
router.post('/signup', signup);

// Login
router.post('/login', login);

// Logout
router.post('/logout', logout);

// Verify email
router.post('/verify-email', verifyEmail);

//forgot password
router.post('/forgot-password',forgotPassword);

//reset password
router.post('/reset-password', resetPassword);
export default router;