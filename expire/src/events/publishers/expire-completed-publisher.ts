import { Publisher, Subjects, ExpireCompletedEvent } from '@dbtickets68/common';

export class ExpireCompletedPublisher extends Publisher<ExpireCompletedEvent> {
  subject: Subjects.ExpireCompleted = Subjects.ExpireCompleted;
}
