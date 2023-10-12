import mongoose from 'mongoose';
import { app } from './app';
import { natsWrapper } from './nats-wrapper';
import { OrderCancelledListener } from './events/listeners/order-cancelled-listener';
import { OrderCreatedListener } from './events/listeners/order-created-listener';

const start = async () => {
  if (!process.env.JWT_KEY) {
    throw new Error('Must have JWT_KEY defined');
  }
  if (!process.env.MONGO_URI) {
    throw new Error('Must have MONGO_URI defined');
  }
  if (!process.env.NATS_URL) {
    throw new Error('Must have NATS_URL defined');
  }
  if (!process.env.NATS_CLIENT_ID) {
    throw new Error('Must have NATS_CLIENT_ID defined');
  }
  if (!process.env.NATS_CLUSTER_ID) {
    throw new Error('Must have NATS_CLIENT_ID defined');
  }
  try {
    await natsWrapper.connect(
      process.env.NATS_CLUSTER_ID,
      process.env.NATS_CLIENT_ID,
      process.env.NATS_URL
    );
    natsWrapper.client.on('close', () => {
      console.log('NATS Connection closed');
      process.exit();
    });
    process.on('SIGINT', () => natsWrapper.client.close());
    process.on('SIGTERM', () => natsWrapper.client.close());

    new OrderCreatedListener(natsWrapper.client).listen();
    new OrderCancelledListener(natsWrapper.client).listen();

    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to Mongo DB: tickets');
  } catch (err) {
    console.log(err);
  }

  app.listen(3000, () => {
    console.log('Tickets service is listening on port 3000');
  });
};

start();
