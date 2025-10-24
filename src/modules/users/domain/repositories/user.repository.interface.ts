import { User } from '../entities/user.entity';

/**
 * Domain repository interface
 * This defines the contract for user persistence from the domain perspective.
 * 
 * Why in Domain Layer?
 * - The domain defines WHAT it needs to persist
 * - Infrastructure implements HOW to persist it
 * - This keeps domain independent of infrastructure details
 */
export interface IUserRepository {
  save(user: User): Promise<User>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findAll(): Promise<User[]>;
  update(user: User): Promise<User>;
  delete(id: string): Promise<void>;
}

/**
 * Symbol for dependency injection
 * Used to inject the repository implementation
 */
export const USER_REPOSITORY = Symbol('IUserRepository');
