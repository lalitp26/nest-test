import { v4 as uuidv4 } from 'uuid';
import { UserActivatedEvent, UserCreatedEvent, UserDeactivatedEvent } from "../events";
import { Email } from "../value-objects";

export class User {
  private _id: string;
  private _firstName: string;
  private _lastName: string;
  private _email: Email;
  private _password: string;
  private _isActive: boolean;
  private _createdAt: Date;
  private _updatedAt: Date;
  private _domainEvents: any[] = [];

  private constructor(
    id: string,
    firstName: string,
    lastName: string,
    email: Email,
    password: string,
    isActive: boolean,
    createdAt: Date,
    updatedAt: Date,
  ) {
    this._id = id;
    this._firstName = firstName;
    this._lastName = lastName;
    this._email = email;
    this._password = password;
    this._isActive = isActive;
    this._createdAt = createdAt;
    this._updatedAt = updatedAt;
  }

  // Factory method for creating new users
  static create(
    firstName: string,
    lastName: string,
    email: Email,
    password: string,
  ): User {
    const user = new User(
      uuidv4(),
      firstName,
      lastName,
      email,
      password,
      true,
      new Date(),
      new Date(),
    );

    user.addDomainEvent(new UserCreatedEvent(user.id, user.email.value));
    return user;
  }

  // Factory method for reconstituting users from persistence
  static reconstitute(
    id: string,
    firstName: string,
    lastName: string,
    email: Email,
    password: string,
    isActive: boolean,
    createdAt: Date,
    updatedAt: Date,
  ): User {
    return new User(
      id,
      firstName,
      lastName,
      email,
      password,
      isActive,
      createdAt,
      updatedAt,
    );
  }

  // Business logic methods
  activate(): void {
    if (this._isActive) {
      throw new Error('User is already active');
    }
    this._isActive = true;
    this._updatedAt = new Date();
    this.addDomainEvent(new UserActivatedEvent(this._id));
  }

  deactivate(): void {
    if (!this._isActive) {
      throw new Error('User is already inactive');
    }
    this._isActive = false;
    this._updatedAt = new Date();
    this.addDomainEvent(new UserDeactivatedEvent(this._id));
  }

  updateProfile(firstName: string, lastName: string): void {
    this._firstName = firstName;
    this._lastName = lastName;
    this._updatedAt = new Date();
  }

  changePassword(newPassword: string): void {
    if (newPassword.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }
    this._password = newPassword;
    this._updatedAt = new Date();
  }

  getFullName(): string {
    return `${this._firstName} ${this._lastName}`;
  }

  validate(): void {
    if (!this._firstName || this._firstName.trim().length < 2) {
      throw new Error('First name must be at least 2 characters long');
    }
    if (!this._lastName || this._lastName.trim().length < 2) {
      throw new Error('Last name must be at least 2 characters long');
    }
    if (!this._email) {
      throw new Error('Email is required');
    }
    if (!this._password) {
      throw new Error('Password is required');
    }
  }

  // Domain events
  private addDomainEvent(event: any): void {
    this._domainEvents.push(event);
  }

  getDomainEvents(): any[] {
    return [...this._domainEvents];
  }

  clearDomainEvents(): void {
    this._domainEvents = [];
  }

  // Getters
  get id(): string {
    return this._id;
  }

  get firstName(): string {
    return this._firstName;
  }

  get lastName(): string {
    return this._lastName;
  }

  get email(): Email {
    return this._email;
  }

  get password(): string {
    return this._password;
  }

  get isActive(): boolean {
    return this._isActive;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }
}
