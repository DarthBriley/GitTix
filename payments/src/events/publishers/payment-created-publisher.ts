import { Subjects, Publisher, PaymentCreatedEvent } from '@dbtickets68/common';

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
}
