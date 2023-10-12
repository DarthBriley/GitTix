import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { OrderCancelledEvent, OrderStatus } from '@dbtickets68/common';
import { OrderCancelledListener } from '../order-cancelled-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { Order } from '../../../models/order';

const setup = async () => {
  const listener = new OrderCancelledListener(natsWrapper.client);
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    status: OrderStatus.Created,
    userId: new mongoose.Types.ObjectId().toHexString(),
    price: 100,
  });
  await order.save();
  const data: OrderCancelledEvent['data'] = {
    id: order.id,
    version: 1,
    ticket: { id: new mongoose.Types.ObjectId().toHexString() },
  };
  //@ts-ignore
  const msg: Message = { ack: jest.fn() };
  return { listener, order, data, msg };
};

it('Sets status to cancelled', async () => {
  const { listener, order, data, msg } = await setup();
  await listener.onMessage(data, msg);
  const foundOrder = await Order.findById(order.id);
  expect(foundOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('Sends ack for message', async () => {
  const { listener, order, data, msg } = await setup();
  await listener.onMessage(data, msg);
  expect(msg.ack).toHaveBeenCalled();
});
