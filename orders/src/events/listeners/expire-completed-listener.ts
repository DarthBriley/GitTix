import { Listener, Subjects, ExpireCompletedEvent } from '@dbtickets68/common';
import { Message } from 'node-nats-streaming';
import { Order } from '../../models/order';
import { queueGroupName } from './queue-group-name';
import { OrderStatus } from '@dbtickets68/common';
import { OrderCancelledPublisher } from '../publishers/order-cancelled-publisher';
import { natsWrapper } from '../../nats-wrapper';

export class ExpireCompletedListener extends Listener<ExpireCompletedEvent> {
  subject: Subjects.ExpireCompleted = Subjects.ExpireCompleted;
  queueGroupName = queueGroupName;
  async onMessage(data: ExpireCompletedEvent['data'], msg: Message) {
    const { orderId } = data;
    const order = await Order.findById(data.orderId).populate('ticket');
    if (!order) {
      throw new Error('Order not found');
    }
    if (order.status === OrderStatus.Completed) {
      return msg.ack();
    }
    order.set({ status: OrderStatus.Cancelled });
    await order.save();
    await new OrderCancelledPublisher(this.client).publish({
      id: order.id,
      version: order.version,
      ticket: { id: order.ticket.id },
    });
    msg.ack();
  }
}
