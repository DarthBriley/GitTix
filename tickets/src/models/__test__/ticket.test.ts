import { Ticket } from '../ticket';

it('Implements Version Control with failure', async () => {
  const ticket = Ticket.build({
    title: 'Concert',
    price: 50,
    userId: 'abc123',
  });
  await ticket.save();
  const firstInstance = await Ticket.findById(ticket.id);
  const secondInstance = await Ticket.findById(ticket.id);
  firstInstance!.set({ price: 60 });
  secondInstance!.set({ price: 80 });
  await firstInstance!.save();
  try {
    await secondInstance!.save();
  } catch (err) {
    return;
  }
  throw new Error('Should never get here');
});

it('Implements Version Control with increments', async () => {
  const ticket = Ticket.build({
    title: 'Concert',
    price: 50,
    userId: 'abc123',
  });
  await ticket.save();
  expect(ticket.version).toEqual(0);
  await ticket.save();
  expect(ticket.version).toEqual(1);
  await ticket.save();
  expect(ticket.version).toEqual(2);
});
