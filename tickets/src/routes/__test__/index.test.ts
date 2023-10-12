import request from 'supertest';
import { app } from '../../app';

const createTicket = async () => {
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({ title: "Test", price: 20 })
}

it('return tickets', async () => {
  await createTicket();
  await createTicket();
  await createTicket();
  const response = await request(app)
    .get('/api/tickets/')
    .send()
    .expect(200);
  expect(response.body.length).toEqual(3);
}) 