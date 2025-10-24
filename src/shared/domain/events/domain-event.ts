export interface IDomainEvent {
  occurredOn: Date;
}

export abstract class DomainEvent implements IDomainEvent {
  public readonly occurredOn: Date;

  constructor() {
    this.occurredOn = new Date();
  }
}
