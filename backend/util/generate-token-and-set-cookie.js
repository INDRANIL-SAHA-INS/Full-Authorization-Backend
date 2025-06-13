import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';

export function generateTokenAndSetCookie(res, userId) {
  const JWT_SECRET = process.env.JWT_SECRET;
  const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '30d' });

  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
  });

  return token;
}
