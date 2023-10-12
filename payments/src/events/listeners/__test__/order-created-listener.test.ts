import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { OrderCreatedEvent, OrderStatus } from '@dbtickets68/common';
import { OrderCreatedListener } from '../order-create-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { Order } from '../../../models/order';

const setup = async () => {
  const listener = new OrderCreatedListener(natsWrapper.client);
  const data: OrderCreatedEvent['data'] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    status: OrderStatus.Created,
    userId: new mongoose.Types.ObjectId().toHexString(),
    expiresAt: 'Fake TimeStamp',
    ticket: { id: new mongoose.Types.ObjectId().toHexString(), price: 100 },
  };
  //@ts-ignore
  const msg: Message = { ack: jest.fn() };
  return { listener, data, msg };
};

it('Replicates order info', async () => {
  const { listener, data, msg } = await setup();
  await listener.onMessage(data, msg);
  const foundOrder = await Order.findById(data.id);
  expect(foundOrder!.price).toEqual(data.ticket.price);
});

it('Sends ack for message', async () => {
  const { listener, data, msg } = await setup();
  await listener.onMessage(data, msg);
  expect(msg.ack).toHaveBeenCalled();
});
