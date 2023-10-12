import { Publisher, OrderUpdatedEvent, Subjects } from '@dbtickets68/common';

export class OrderUpdatedPublisher extends Publisher<OrderUpdatedEvent> {
  subject: Subjects.OrderUpdated = Subjects.OrderUpdated;
}
