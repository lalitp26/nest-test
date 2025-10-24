import { Injectable } from '@nestjs/common';
import { Order } from '../entities/order.entity';
import { IOrderRepository } from '../repositories/order.repository.interface';

/**
 * Domain service for complex business logic that doesn't belong to a single entity.
 * 
 * Domain services can use repository interfaces when they need to:
 * 1. Validate business rules that require checking existing data
 * 2. Coordinate between multiple entities
 * 3. Implement complex domain logic
 * 
 * Example: If you need to check if a customer has too many pending orders
 * before creating a new one, you would inject IOrderRepository here.
 */
@Injectable()
export class OrderValidationService {
  /**
   * IMPORTANT: Domain services CAN accept repositories via constructor
   * because the repository interface is defined in the domain layer.
   * 
   * Uncomment this if your domain service needs data access:
   * 
   * constructor(
   *   @Inject(ORDER_REPOSITORY)
   *   private readonly orderRepository: IOrderRepository,
   * ) {}
   */

  validateOrderBeforeConfirmation(order: Order): boolean {
    // Complex business rules that involve multiple entities or external factors
    const total = order.calculateTotal();
    
    if (total <= 0) {
      throw new Error('Order total must be greater than zero');
    }

    if (order.items.length === 0) {
      throw new Error('Order must have at least one item');
    }

    return true;
  }

  canOrderBeCancelled(order: Order): boolean {
    const allowedStatuses = ['PENDING', 'CONFIRMED'];
    return allowedStatuses.includes(order.status);
  }

  /**
   * Example of a domain service method that would use the repository:
   * 
   * async canCustomerCreateMoreOrders(customerId: string): Promise<boolean> {
   *   const pendingOrders = await this.orderRepository.findByCustomerId(customerId);
   *   const pendingCount = pendingOrders.filter(o => o.status === 'PENDING').length;
   *   return pendingCount < 5; // Business rule: max 5 pending orders
   * }
   */
}
