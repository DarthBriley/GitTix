import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { ExpireCompletedEvent } from '@dbtickets68/common';
import { ExpireCompletedListener } from '../expire-completed-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { Ticket } from '../../../models/ticket';
import { Order } from '../../../models/order';
import { OrderStatus } from '@dbtickets68/common';
import { JsxText } from 'typescript';

const setup = async () => {
  const listener = new ExpireCompletedListener(natsWrapper.client);
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'New Concert 2',
    price: 299,
  });
  await ticket.save();
  const order = Order.build({
    status: OrderStatus.Created,
    userId: 'Fake ID',
    expiresAt: new Date(),
    ticket,
  });
  await order.save();
  const data: ExpireCompletedEvent['data'] = {
    orderId: order.id,
  };
  //@ts-ignore
  const msg: Message = { ack: jest.fn() };
  return { listener, ticket, order, data, msg };
};

it('Update status to cancelled', async () => {
  const { listener, order, ticket, data, msg } = await setup();
  await listener.onMessage(data, msg);
  const updatedOrder = await Order.findById(order.id);
  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('Publish OrderCancelled event', async () => {
  const { listener, order, ticket, data, msg } = await setup();
  await listener.onMessage(data, msg);
  expect(natsWrapper.client.publish).toHaveBeenCalled();
  const eventData = JSON.parse(
    (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
  );
  expect(eventData.id).toEqual(order.id);
});

it('Sends ack for message', async () => {
  const { listener, order, ticket, data, msg } = await setup();
  await listener.onMessage(data, msg);
  expect(msg.ack).toHaveBeenCalled();
});
