import request from "supertest";
import { app } from "../../app";

it('returns a 201 on successful signup', async () => {
  await request(app)
  .post('/api/users/signup')
  .send({
    email:  'test13@test.com',
    password: 'password'
  })
  .expect(201);
})

it('returns a 400 with invalid email', async () => {
  await request(app)
  .post('/api/users/signup')
  .send({
    email:  'testt.com',
    password: 'password'
  })
  .expect(400);
})

it('returns a 400 with invalid password', async () => {
  await request(app)
  .post('/api/users/signup')
  .send({
    email:  'test12@test.com',
    password: 'pad'
  })
  .expect(400);
})

it('returns a 400 with no data', async () => {
  await request(app)
  .post('/api/users/signup')
  .send({})
  .expect(400);
})

it('Disallows duplicate emails', async () => {
  await request(app)
  .post('/api/users/signup')
  .send({
    email:  'test13@test.com',
    password: 'password'
  })
  .expect(201);
  await request(app)
  .post('/api/users/signup')
  .send({
    email:  'test13@test.com',
    password: 'password'
  })
  .expect(400);
})

it('Sets cookie after successful signup', async () => {
  const response = await request(app)
    .post('/api/users/signup')
    .send({
     email:  'test12@test.com',
      password: 'password'
    })
    .expect(201);
  expect(response.get('Set-Cookie')).toBeDefined();
});