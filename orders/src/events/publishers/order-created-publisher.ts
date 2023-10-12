import { Publisher, OrderCreatedEvent, Subjects } from '@dbtickets68/common';

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
}
