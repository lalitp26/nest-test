import { v4 as uuidv4 } from 'uuid';
import { OrderItem } from '../value-objects/order-item.vo';
import { OrderCreatedEvent } from '../events/order-created.event';
import { OrderStatusChangedEvent } from '../events/order-status-changed.event';

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

export class Order {
  private _id: string;
  private _customerId: string;
  private _items: OrderItem[];
  private _status: OrderStatus;
  private _createdAt: Date;
  private _updatedAt: Date;
  private _domainEvents: any[] = [];

  private constructor(
    id: string,
    customerId: string,
    items: OrderItem[],
    status: OrderStatus,
    createdAt: Date,
    updatedAt: Date,
  ) {
    this._id = id;
    this._customerId = customerId;
    this._items = items;
    this._status = status;
    this._createdAt = createdAt;
    this._updatedAt = updatedAt;
  }

  // Factory method for creating new orders
  static create(customerId: string, items: OrderItem[]): Order {
    const order = new Order(
      uuidv4(),
      customerId,
      items,
      OrderStatus.PENDING,
      new Date(),
      new Date(),
    );

    order.addDomainEvent(new OrderCreatedEvent(order.id, order.customerId));
    return order;
  }

  // Factory method for reconstituting orders from persistence
  static reconstitute(
    id: string,
    customerId: string,
    items: OrderItem[],
    status: OrderStatus,
    createdAt: Date,
    updatedAt: Date,
  ): Order {
    return new Order(id, customerId, items, status, createdAt, updatedAt);
  }

  // Business logic methods
  confirm(): void {
    if (this._status !== OrderStatus.PENDING) {
      throw new Error('Only pending orders can be confirmed');
    }
    this.changeStatus(OrderStatus.CONFIRMED);
  }

  ship(): void {
    if (this._status !== OrderStatus.CONFIRMED) {
      throw new Error('Only confirmed orders can be shipped');
    }
    this.changeStatus(OrderStatus.SHIPPED);
  }

  deliver(): void {
    if (this._status !== OrderStatus.SHIPPED) {
      throw new Error('Only shipped orders can be delivered');
    }
    this.changeStatus(OrderStatus.DELIVERED);
  }

  cancel(): void {
    if (this._status === OrderStatus.DELIVERED) {
      throw new Error('Delivered orders cannot be cancelled');
    }
    this.changeStatus(OrderStatus.CANCELLED);
  }

  private changeStatus(newStatus: OrderStatus): void {
    const oldStatus = this._status;
    this._status = newStatus;
    this._updatedAt = new Date();
    this.addDomainEvent(
      new OrderStatusChangedEvent(this._id, oldStatus, newStatus),
    );
  }

  calculateTotal(): number {
    return this._items.reduce((total, item) => total + item.subtotal, 0);
  }

  validate(): void {
    if (!this._customerId) {
      throw new Error('Customer ID is required');
    }
    if (!this._items || this._items.length === 0) {
      throw new Error('Order must have at least one item');
    }
    this._items.forEach(item => item.validate());
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

  get customerId(): string {
    return this._customerId;
  }

  get items(): OrderItem[] {
    return [...this._items];
  }

  get status(): string {
    return this._status;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }
}
