import express from 'express';
import { connectDB } from './Database/database.js';
import authRoutes from './Routes/auth-routes.js';
// import userRoutes from './Routes/user-routes.js';
import cookieparser from 'cookie-parser';
import dotenv from 'dotenv';

const app = express();
const PORT = process.env.PORT || 5000;

dotenv.config();
// Middleware to parse JSON
app.use(express.json());
app.use(cookieparser());


// Use routes
app.use('/api/auth', authRoutes);
// app.use('/api/users', userRoutes);

// Basic route
app.get('/', (req, res) => {
  res.send('API is running...');
});

app.listen(PORT, () => {
  // Connect to database
  connectDB();
  console.log(`Server started at http://localhost:${PORT}`);
});