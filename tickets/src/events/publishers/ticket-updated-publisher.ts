import { Publisher, TicketUpdatedEvent, Subjects } from '@dbtickets68/common';

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated;
}
