import { natsWrapper } from './nats-wrapper';
import { OrderCreatedListener } from './events/listeners/order-created-listener';

const start = async () => {
  console.log('Starting up expire service ...');
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
  } catch (err) {
    console.error(err);
  }
};
start();
