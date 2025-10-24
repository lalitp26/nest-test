export interface IEventPublisher {
  publish<T>(event: T): Promise<void>;
  publishAll<T>(events: T[]): Promise<void>;
}

export const EVENT_PUBLISHER = Symbol('IEventPublisher');
