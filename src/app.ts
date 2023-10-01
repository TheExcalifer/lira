import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

const app = express();

dotenv.config();

app.use(express.json());

import liraRoutes from './routes/lira.js';
app.use('/', liraRoutes);

import adminRoutes from './routes/admin.js';
app.use('/admin', adminRoutes);

const initilize = async () => {
  try {
    const CONNECTION_STRING = process.env.CONNECTION_STRING!;
    await mongoose.connect(CONNECTION_STRING);
    console.log('connected');
    app.listen(process.env.SERVER_PORT);
  } catch (error) {
    console.error('Connection string is incorrect');
  }
};

initilize();
