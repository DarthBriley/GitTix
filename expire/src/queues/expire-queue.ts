import Queue from 'bull';
import { ExpireCompletedPublisher } from '../events/publishers/expire-completed-publisher';
import { natsWrapper } from '../nats-wrapper';

interface Payload {
  orderId: string;
}

const expireQueue = new Queue<Payload>('order:expire', {
  redis: { host: process.env.REDIS_HOST },
});

expireQueue.process(async (job) => {
  new ExpireCompletedPublisher(natsWrapper.client).publish({
    orderId: job.data.orderId,
  });
});

export { expireQueue };
