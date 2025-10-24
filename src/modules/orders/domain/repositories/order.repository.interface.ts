import { Order } from '../entities/order.entity';

/**
 * Domain repository interface
 * This defines the contract for order persistence from the domain perspective.
 * 
 * Why in Domain Layer?
 * - The domain defines WHAT it needs to persist
 * - Infrastructure implements HOW to persist it
 * - This keeps domain independent of infrastructure details
 */
export interface IOrderRepository {
  save(order: Order): Promise<Order>;
  findById(id: string): Promise<Order | null>;
  findByCustomerId(customerId: string): Promise<Order[]>;
  findAll(): Promise<Order[]>;
  update(order: Order): Promise<Order>;
  delete(id: string): Promise<void>;
}

/**
 * Symbol for dependency injection
 * Used to inject the repository implementation
 */
export const ORDER_REPOSITORY = Symbol('IOrderRepository');
