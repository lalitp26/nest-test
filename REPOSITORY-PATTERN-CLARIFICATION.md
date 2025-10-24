# DDD + Hexagonal Architecture - Repository Pattern Clarification

## 🎯 THE GOLDEN RULE

**Repository interfaces MUST be defined in the DOMAIN layer, NOT in the Application layer.**

## ❓ Why This Matters

This is the **Dependency Inversion Principle** in action:

```
┌─────────────────────────────────────────────────────────────┐
│                    DEPENDENCY FLOW                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Infrastructure  ──────►  Application  ──────►  Domain     │
│   (implements)           (orchestrates)        (defines)    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Traditional Approach (WRONG ❌)
```typescript
// Domain depends on Infrastructure
Domain Layer → Infrastructure Layer (Database)
// This creates tight coupling!
```

### DDD Approach (CORRECT ✅)
```typescript
// Infrastructure depends on Domain
Infrastructure Layer → Domain Layer (Interface)
// This inverts the dependency!
```

## 📁 Correct Folder Structure

```
src/modules/users/
├── domain/                              # CORE (No dependencies)
│   ├── entities/
│   │   └── user.entity.ts              # Rich domain model
│   ├── repositories/                    # ✅ REPOSITORY INTERFACE HERE!
│   │   ├── user.repository.interface.ts # Interface (what domain needs)
│   │   └── index.ts
│   ├── services/
│   │   └── user-validation.service.ts  # Can inject IUserRepository
│   └── value-objects/
│       └── email.vo.ts
│
├── application/                         # Use Cases
│   ├── use-cases/
│   │   └── create-user.use-case.impl.ts # Injects IUserRepository
│   └── ports/
│       ├── inbound/                     # Use case interfaces
│       │   └── create-user.use-case.ts
│       └── outbound/                    # External service interfaces
│           ├── user-repository.port.ts  # Re-exports from domain
│           └── password-hasher.port.ts  # NOT a repository
│
└── infrastructure/                      # Technical Implementation
    ├── adapters/
    └── persistence/
        └── typeorm/
            └── repositories/
                └── user-typeorm.repository.ts # ✅ IMPLEMENTS domain interface
```

## 🔍 Detailed Explanation

### 1. Domain Layer - Repository Interface

**Location**: `domain/repositories/user.repository.interface.ts`

```typescript
import { User } from '../entities/user.entity';

// ✅ This interface defines WHAT the domain needs
export interface IUserRepository {
  save(user: User): Promise<User>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findAll(): Promise<User[]>;
  update(user: User): Promise<User>;
  delete(id: string): Promise<void>;
}

// Symbol for dependency injection
export const USER_REPOSITORY = Symbol('IUserRepository');
```

**Why here?**
- ✅ Domain defines WHAT it needs to persist
- ✅ Domain stays independent of infrastructure
- ✅ Domain can use repository in domain services
- ✅ Follows Dependency Inversion Principle

### 2. Application Layer - Re-export (Optional)

**Location**: `application/ports/outbound/user-repository.port.ts`

```typescript
// Simply re-export from domain
export { 
  IUserRepository, 
  USER_REPOSITORY 
} from '../../../domain/repositories/user.repository.interface';
```

**Why?**
- Makes it convenient for application layer imports
- Maintains the "ports" concept in hexagonal architecture
- Both approaches work, but source of truth is DOMAIN

### 3. Application Layer - Use Case

**Location**: `application/use-cases/create-user.use-case.impl.ts`

```typescript
import { Inject, Injectable } from '@nestjs/common';
import { IUserRepository, USER_REPOSITORY } from '../../../domain/repositories/user.repository.interface';
// OR: import { IUserRepository, USER_REPOSITORY } from '../ports/outbound/user-repository.port';

@Injectable()
export class CreateUserUseCaseImpl {
  constructor(
    @Inject(USER_REPOSITORY)  // ✅ Inject using the symbol
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(dto: CreateUserDto): Promise<UserResponseDto> {
    // Use the repository
    const user = User.create(...);
    const saved = await this.userRepository.save(user);
    return this.mapper.toDto(saved);
  }
}
```

### 4. Domain Layer - Domain Service

**Location**: `domain/services/user-validation.service.ts`

```typescript
import { Injectable, Inject } from '@nestjs/common';
import { IUserRepository, USER_REPOSITORY } from '../repositories/user.repository.interface';

@Injectable()
export class UserValidationService {
  constructor(
    @Inject(USER_REPOSITORY)  // ✅ YES! Domain services can inject repos
    private readonly userRepository: IUserRepository,
  ) {}

  // Example: Business rule that needs data access
  async isEmailAvailable(email: string): Promise<boolean> {
    const existingUser = await this.userRepository.findByEmail(email);
    return existingUser === null;
  }

  // Example: Business rule without data access
  validatePasswordStrength(password: string): boolean {
    // Pure business logic
    return password.length >= 8;
  }
}
```

**Important**: Domain services CAN inject repositories because the interface is in the domain!

### 5. Infrastructure Layer - Repository Implementation

**Location**: `infrastructure/persistence/typeorm/repositories/user-typeorm.repository.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
// ✅ Import interface from DOMAIN
import { IUserRepository } from '../../../../domain/repositories/user.repository.interface';
import { User } from '../../../../domain/entities/user.entity';
import { UserTypeormEntity } from '../entities/user.typeorm-entity';
import { UserTypeormMapper } from '../mappers/user-typeorm.mapper';

@Injectable()
export class UserTypeormRepository implements IUserRepository {
  constructor(
    @InjectRepository(UserTypeormEntity)
    private readonly repository: Repository<UserTypeormEntity>,
    private readonly mapper: UserTypeormMapper,
  ) {}

  async save(user: User): Promise<User> {
    const entity = this.mapper.toPersistence(user);
    const saved = await this.repository.save(entity);
    return this.mapper.toDomain(saved);
  }

  // ... implement all interface methods
}
```

### 6. Module Configuration

**Location**: `users.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Domain
import { USER_REPOSITORY } from './domain/repositories/user.repository.interface';
import { UserValidationService } from './domain/services/user-validation.service';

// Application
import { CREATE_USER_USE_CASE } from './application/ports/inbound/create-user.use-case';
import { CreateUserUseCaseImpl } from './application/use-cases/create-user.use-case.impl';

// Infrastructure
import { UserTypeormEntity } from './infrastructure/persistence/typeorm/entities/user.typeorm-entity';
import { UserTypeormRepository } from './infrastructure/persistence/typeorm/repositories/user-typeorm.repository';

@Module({
  imports: [TypeOrmModule.forFeature([UserTypeormEntity])],
  providers: [
    // Use Cases
    {
      provide: CREATE_USER_USE_CASE,
      useClass: CreateUserUseCaseImpl,
    },
    // Repositories - Infrastructure implements Domain interface
    {
      provide: USER_REPOSITORY,  // ✅ Symbol from DOMAIN
      useClass: UserTypeormRepository,  // ✅ Implementation from INFRASTRUCTURE
    },
    // Domain Services
    UserValidationService,
  ],
})
export class UsersModule {}
```

## 📝 Application Ports - What Goes There?

### ✅ DO Put in Application Ports (Outbound)

1. **External Service Interfaces** (NOT repositories)
```typescript
// application/ports/outbound/password-hasher.port.ts
export interface IPasswordHasher {
  hash(password: string): Promise<string>;
  compare(password: string, hash: string): Promise<boolean>;
}

// application/ports/outbound/email-service.port.ts
export interface IEmailService {
  sendWelcomeEmail(email: string): Promise<void>;
}

// application/ports/outbound/payment-service.port.ts
export interface IPaymentService {
  processPayment(amount: number): Promise<void>;
}
```

2. **Re-exports** (for convenience)
```typescript
// application/ports/outbound/user-repository.port.ts
export { IUserRepository, USER_REPOSITORY } from '../../../domain/repositories/user.repository.interface';
```

### ❌ DON'T Put in Application Ports

1. **Repository Interfaces** - These belong in DOMAIN
2. **Domain Entities** - These belong in DOMAIN
3. **Domain Services** - These belong in DOMAIN

## 🎓 Common Questions

### Q1: Can Domain Services use Repositories?
**A: YES!** ✅

```typescript
// domain/services/user-validation.service.ts
@Injectable()
export class UserValidationService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async isEmailUnique(email: string): Promise<boolean> {
    const user = await this.userRepository.findByEmail(email);
    return user === null;
  }
}
```

Because the repository interface is in the domain layer, domain services can use it!

### Q2: Should I put repository interface in Domain or Application?
**A: DOMAIN layer** ✅

This is the industry standard for DDD + Hexagonal Architecture.

### Q3: What if I need to swap databases?
**A: Perfect!** That's exactly why we do this:

```typescript
// Just change the provider in module
{
  provide: USER_REPOSITORY,
  useClass: UserMongoRepository,  // Changed from TypeORM to MongoDB
}
// No changes needed in domain or application layers!
```

### Q4: Can Application layer use Domain repositories?
**A: YES!** ✅

```typescript
// application/use-cases/create-user.use-case.impl.ts
constructor(
  @Inject(USER_REPOSITORY)  // From domain
  private readonly userRepository: IUserRepository,
) {}
```

## 🚀 Summary - The Correct Way

```typescript
┌──────────────────────────────────────────────────────────────┐
│                     CORRECT ARCHITECTURE                     │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  1. DOMAIN defines interface:                                │
│     domain/repositories/user.repository.interface.ts         │
│                                                              │
│  2. DOMAIN SERVICES inject interface:                        │
│     domain/services/user-validation.service.ts               │
│                                                              │
│  3. APPLICATION injects interface:                           │
│     application/use-cases/create-user.use-case.impl.ts       │
│                                                              │
│  4. INFRASTRUCTURE implements interface:                     │
│     infrastructure/persistence/.../user-typeorm.repository.ts│
│                                                              │
│  5. MODULE binds implementation to interface:                │
│     users.module.ts                                          │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

## ✨ Benefits

1. **Testability**: Mock repositories easily
2. **Flexibility**: Swap implementations without touching domain
3. **Independence**: Domain has zero infrastructure dependencies
4. **Clarity**: Clear separation of concerns
5. **Maintainability**: Each layer has a single responsibility

---

**Remember**: The domain defines WHAT it needs, infrastructure implements HOW to provide it. This is the essence of Dependency Inversion! 🎯
