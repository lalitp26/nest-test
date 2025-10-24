import { Injectable } from '@nestjs/common';
import { User } from '../entities/user.entity';
import { IUserRepository } from '../repositories/user.repository.interface';

/**
 * Domain service for complex business logic that doesn't belong to a single entity.
 * 
 * Domain services can use repository interfaces when they need to:
 * 1. Validate business rules that require checking existing data
 * 2. Coordinate between multiple entities
 * 3. Implement complex domain logic
 * 
 * Example: If you need to check if an email is already taken before creating a user,
 * you would inject IUserRepository here.
 */
@Injectable()
export class UserValidationService {
  /**
   * IMPORTANT: Domain services CAN accept repositories via constructor
   * because the repository interface is defined in the domain layer.
   * 
   * Uncomment this if your domain service needs data access:
   * 
   * constructor(
   *   @Inject(USER_REPOSITORY)
   *   private readonly userRepository: IUserRepository,
   * ) {}
   */

  validatePasswordStrength(password: string): boolean {
    // Complex password validation rules
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const isLongEnough = password.length >= 8;

    return hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar && isLongEnough;
  }

  canUserBeDeleted(user: User): boolean {
    // Business rules for user deletion
    // For example: active users with recent activity cannot be deleted
    return !user.isActive;
  }

  /**
   * Example of a domain service method that would use the repository:
   * 
   * async isEmailAvailable(email: string): Promise<boolean> {
   *   const existingUser = await this.userRepository.findByEmail(email);
   *   return existingUser === null;
   * }
   */
}
