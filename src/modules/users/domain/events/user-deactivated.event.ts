export class UserDeactivatedEvent {
  constructor(
    public readonly userId: string,
    public readonly occurredOn: Date = new Date(),
  ) {}
}
