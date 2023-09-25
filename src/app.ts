import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

const app = express();

dotenv.config({ path: '../.env' });

app.use(express.json());

import authRoutes from './routes/auth/user-auth.js';
app.use('/auth', authRoutes);

const initilize = async () => {
  try {
    const CONNECTION_STRING = process.env.CONNECTION_STRING!;
    await mongoose.connect(CONNECTION_STRING);
    app.listen(process.env.SERVER_PORT);
  } catch (error) {
    console.error('Connection string is incorrect');
  }
};

initilize();
