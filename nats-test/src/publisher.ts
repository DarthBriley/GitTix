import nats from 'node-nats-streaming';
import { randomBytes } from 'crypto';
import { TicketCreatedPublisher } from './events/ticket-created-publisher';
import { CompanyModule } from '@faker-js/faker';
import { Console } from 'console';

console.clear();

const stan = nats.connect('GitTix', randomBytes(4).toString('hex'), { url: 'http://localhost:4222'});
stan.on("connect", async () => { console.log('Publisher connected to NATS');
const publisher = new TicketCreatedPublisher(stan);
try {
await publisher.publish({id: '123', title: 'concert', price: 25, userId: '123456asc'});
} catch (err) { console.error(err); }
  // const data = JSON.stringify({id: '123', title: 'concert', price: 25});
  // stan.publish('ticket:created', data, () => {console.log('Event published')});
});