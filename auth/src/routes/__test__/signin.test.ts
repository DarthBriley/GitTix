import request from "supertest";
import { app } from "../../app";

it('returns a 400 with invalid email', async () => {
  await request(app)
  .post('/api/users/signin')
  .send({
    email:  'testt.com',
    password: 'password'
  })
  .expect(400);
})

it('returns a 400 with invalid password', async () => {
  await request(app)
  .post('/api/users/signin')
  .send({
    email:  'test12@test.com',
    password: ''
  })
  .expect(400);
})

it('returns a 400 with no data', async () => {
  await request(app)
  .post('/api/users/signin')
  .send({})
  .expect(400);
})

it('returns a 400 with non-exist email', async () => {
  await request(app)
  .post('/api/users/signin')
  .send({
    email:  'test33@test.com',
    password: 'password'
  })
  .expect(400);
})

it('Incorrect password', async () => {
  await request(app)
  .post('/api/users/signup')
  .send({
    email:  'test23@test.com',
    password: 'password'
  })
  .expect(201);
  await request(app)
  .post('/api/users/signin')
  .send({
    email:  'test23@test.com',
    password: 'p12345rd'
  })
  .expect(400);
})

it('Correct Login', async () => {
  await request(app)
  .post('/api/users/signup')
  .send({
    email:  'test23@test.com',
    password: 'password'
  })
  .expect(201);
  const response = await request(app)
  .post('/api/users/signin')
  .send({
    email:  'test23@test.com',
    password: 'password'
  })
  .expect(200);
  expect(response.get('Set-Cookie')).toBeDefined();  
})