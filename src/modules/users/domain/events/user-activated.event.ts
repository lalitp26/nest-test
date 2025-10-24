export class UserActivatedEvent {
  constructor(
    public readonly userId: string,
    public readonly occurredOn: Date = new Date(),
  ) {}
}
