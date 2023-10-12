import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { app } from '../app';
import request from 'supertest';

var jwt = require('jsonwebtoken');

declare global {
  var signin: (id?: string) => string[];
}

jest.mock('../nats-wrapper');
process.env.STRIP_KEY =
  'sk_test_51NzmVQG35MBWlDmPbPi8KPfoRTr7iFCruO50tzQa1sQjBHCCyiROF2BPPp1wCvsJLBCjrzQJFUCMS6BPBeUU7A3z00UJsAUdSE';

let mongo: any;
beforeAll(async () => {
  process.env.JWT_KEY = 'asdfghi';
  mongo = await MongoMemoryServer.create();
  const mongoUri = mongo.getUri();
  await mongoose.connect(mongoUri, {});
});

beforeEach(async () => {
  jest.clearAllMocks();
  const collections = await mongoose.connection.db.collections();
  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  if (mongo) {
    await mongo.stop();
  }
  await mongoose.connection.close();
});

global.signin = (id?: string) => {
  const payload = {
    id: id || new mongoose.Types.ObjectId().toHexString(),
    email: 'dave123@test.com',
  };
  const token = jwt.sign(payload, process.env.JWT_KEY);
  const session = { jwt: token };
  const sessionJSON = JSON.stringify(session);
  const base64 = Buffer.from(sessionJSON).toString('base64');
  return [`session=${base64}`];
};
