import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { OrderCancelledEvent, OrderStatus } from '@dbtickets68/common';
import { OrderCancelledListener } from '../order-cancelled-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { Ticket } from '../../../models/ticket';

const setup = async () => {
  const listener = new OrderCancelledListener(natsWrapper.client);
  const orderId = new mongoose.Types.ObjectId().toHexString();
  const ticket = Ticket.build({
    title: 'Test Concert',
    price: 100,
    userId: new mongoose.Types.ObjectId().toHexString(),
  });
  ticket.set({ orderId });
  await ticket.save();
  const data: OrderCancelledEvent['data'] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    ticket: { id: ticket.id },
  };
  //@ts-ignore
  const msg: Message = { ack: jest.fn() };
  return { listener, ticket, orderId, data, msg };
};

it('Update ticket, publish event and sends ack', async () => {
  const { listener, ticket, data, msg, orderId } = await setup();
  await listener.onMessage(data, msg);
  const foundTicket = await Ticket.findById(ticket.id);
  expect(foundTicket!.orderId).toEqual(undefined);
  expect(msg.ack).toHaveBeenCalled();
  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
