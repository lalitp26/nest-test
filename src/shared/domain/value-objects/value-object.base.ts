export abstract class ValueObject<T> {
  protected abstract readonly value: T;

  abstract equals(other: ValueObject<T>): boolean;

  protected validate(): void {
    // To be implemented by subclasses
  }
}
