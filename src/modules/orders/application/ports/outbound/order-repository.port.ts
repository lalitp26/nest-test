/**
 * This file re-exports the repository interface from the domain layer.
 * 
 * Repository interfaces belong in the DOMAIN layer because:
 * 1. Domain defines WHAT it needs (persistence contract)
 * 2. Infrastructure implements HOW (actual database code)
 * 3. Application uses the domain interface to orchestrate use cases
 * 
 * This is the Dependency Inversion Principle in action!
 */
export { IOrderRepository, ORDER_REPOSITORY } from '../../../domain/repositories/order.repository.interface';
