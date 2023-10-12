import mongoose from 'mongoose';
import { app } from './app';
import { natsWrapper } from './nats-wrapper';
import { TicketCreatedListener } from './events/listeners/ticket-created-listener';
import { TicketUpdatedListener } from './events/listeners/ticket-updated-listener';
import { ExpireCompletedListener } from './events/listeners/expire-completed-listener';
import { PaymentCreatedListener } from './events/listeners/payment-created-listener';

const start = async () => {
  console.log('Starting up orders service ...');
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

    new TicketCreatedListener(natsWrapper.client).listen();
    new TicketUpdatedListener(natsWrapper.client).listen();
    new ExpireCompletedListener(natsWrapper.client).listen();
    new PaymentCreatedListener(natsWrapper.client).listen();

    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to Mongo DB: orders');
  } catch (err) {
    console.log(err);
  }

  app.listen(3000, () => {
    console.log('orders service is listening on port 3000');
  });
};

start();
