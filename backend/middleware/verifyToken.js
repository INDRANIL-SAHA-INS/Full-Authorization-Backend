import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

export function verifyToken(req, res, next) {
  const token = req.cookies.token ; // Assuming the token is stored in cookies, adjust if using headers or query params

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Failed to authenticate token' });
    }
    
    req.userId = decoded.userId; // Attach userId to request object
    next();
  });
}