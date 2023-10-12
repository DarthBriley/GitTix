import mongoose from 'mongoose';
import { app } from './app';


const start = async () => { 
  if (!process.env.JWT_KEY) {
    throw new Error('Must have JWT_KEY defined');
  }
  if (!process.env.MONGO_URI) {
    throw new Error('Must have MONGO_URI defined');
  }
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to Mongo DB: auth');
  } catch (err) {
    console.log(err);
  }
  app.listen(3000, () => {
    console.log('auth service is listening on port 3000');
  });
};

start();