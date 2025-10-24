export abstract class BaseEntity {
  abstract get id(): string;
  abstract get createdAt(): Date;
  abstract get updatedAt(): Date;
}
