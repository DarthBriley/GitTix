import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';
import { natsWrapper } from "../../nats-wrapper";

it('Route handler listening to /api/tickets', async () => {
  const response = await request(app)
    .post('/api/tickets')
    .send({});
  expect(response.status).not.toEqual(404);
});

it('Access only if user is logged in, not logged in', async () => {
  const response = await request(app)
    .post('/api/tickets')
    .send({})
    .expect(401);
});

it('Access only if user is logged in, logged in', async () => {
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({})
  expect(response.status).not.toEqual(401);
});

it('Error on invalid title', async () => {
  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({title: '', price: 10})
    .expect(400);
  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({price: 10})
    .expect(400);
});

it('Error on invalid price', async () => {
  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({title: 'ticket', price: -10})
    .expect(400);
  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({title:'ticket'})
    .expect(400);
});

it('Works with valid inputs', async () => {
  let tickets = await Ticket.find({});
  expect(tickets.length).toEqual(0);
  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({title:'ticket', price: 10})
    .expect(201);
  tickets = await Ticket.find({});
  expect(tickets.length).toEqual(1);
  expect(tickets[0].title).toEqual('ticket');
  expect(tickets[0].price).toEqual(10);
});

it('Publishes an event', async () => {
  const title = 'DAves Test';
  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({title, price: 1010})
    .expect(201);
  expect(natsWrapper.client.publish).toHaveBeenCalled();
});