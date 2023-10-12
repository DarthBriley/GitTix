import { Publisher, TicketCreatedEvent, Subjects } from "@dbtickets68/common";

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated;
}
