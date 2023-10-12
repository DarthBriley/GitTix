import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { OrderCreatedEvent, OrderStatus } from '@dbtickets68/common';
import { OrderCreatedListener } from '../order-created-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { Ticket } from '../../../models/ticket';

const setup = async () => {
  const listener = new OrderCreatedListener(natsWrapper.client);
  const ticket = Ticket.build({
    title: 'Test Concert',
    price: 100,
    userId: new mongoose.Types.ObjectId().toHexString(),
  });
  await ticket.save();
  const data: OrderCreatedEvent['data'] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    status: OrderStatus.Created,
    userId: new mongoose.Types.ObjectId().toHexString(),
    expiresAt: 'Fake TimeStamp',
    ticket: { id: ticket.id, price: ticket.price },
  };
  //@ts-ignore
  const msg: Message = { ack: jest.fn() };
  return { listener, ticket, data, msg };
};

it('Sets userID of ticket', async () => {
  const { listener, ticket, data, msg } = await setup();
  await listener.onMessage(data, msg);
  const foundTicket = await Ticket.findById(ticket.id);
  expect(foundTicket!.orderId).toEqual(data.id);
});

it('Sends ack for message', async () => {
  const { listener, data, msg } = await setup();
  await listener.onMessage(data, msg);
  expect(msg.ack).toHaveBeenCalled();
});

it('Publishes a ticket updated event', async () => {
  const { listener, ticket, data, msg } = await setup();
  await listener.onMessage(data, msg);
  expect(natsWrapper.client.publish).toHaveBeenCalled();
  const updatedTicketData = JSON.parse(
    (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
  );
  expect(updatedTicketData.orderId).toEqual(data.id);
});
