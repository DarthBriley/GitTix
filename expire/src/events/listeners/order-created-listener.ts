import { Listener, OrderCreatedEvent, Subjects } from '@dbtickets68/common';
import { Message } from 'node-nats-streaming';
import { queueGroupName } from './queue-group-name';
import { expireQueue } from '../../queues/expire-queue';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
  queueGroupName = queueGroupName;
  async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
    const delay = new Date(data.expiresAt).getTime() - new Date().getTime();
    await expireQueue.add({ orderId: data.id }, { delay: delay });
    msg.ack();
  }
}
