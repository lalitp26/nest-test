# 🎯 Quick Reference - DDD + Hexagonal Architecture

## 📦 Where Things Go (No More Confusion!)

```
┌─────────────────────────────────────────────────────────────────┐
│                    LAYER RESPONSIBILITIES                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  DOMAIN         │  WHAT business logic needs                   │
│  (Core)         │  - Entities, Value Objects                   │
│                 │  - Domain Events                             │
│                 │  - Repository INTERFACES ⭐                  │
│                 │  - Domain Services                           │
│                 │  - Business Rules                            │
│                 │                                              │
│  APPLICATION    │  HOW to orchestrate domain                   │
│  (Use Cases)    │  - Use Cases                                 │
│                 │  - DTOs                                      │
│                 │  - Mappers                                   │
│                 │  - External Service Interfaces               │
│                 │                                              │
│  INFRASTRUCTURE │  Technical IMPLEMENTATION                    │
│  (Tech)         │  - Repository IMPLEMENTATIONS ⭐             │
│                 │  - Controllers                               │
│                 │  - ORM Entities                              │
│                 │  - External Service Adapters                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## ✅ Repository Pattern - The Rule

```
╔═════════════════════════════════════════════════════════════════╗
║                    REPOSITORY PATTERN RULE                      ║
╠═════════════════════════════════════════════════════════════════╣
║                                                                 ║
║  1. INTERFACE lives in:   domain/repositories/ ✅               ║
║                                                                 ║
║  2. IMPLEMENTATION in:    infrastructure/persistence/ ✅        ║
║                                                                 ║
║  3. USED BY:             - Domain Services ✅                   ║
║                          - Application Use Cases ✅             ║
║                                                                 ║
║  4. INJECTED via:        Symbol from domain layer ✅            ║
║                                                                 ║
╚═════════════════════════════════════════════════════════════════╝
```

---

## 🔍 Examples - Copy & Paste

### 1️⃣ Define Interface (Domain)

```typescript
// domain/repositories/user.repository.interface.ts
import { User } from '../entities/user.entity';

export interface IUserRepository {
  save(user: User): Promise<User>;
  findById(id: string): Promise<User | null>;
  findAll(): Promise<User[]>;
}

export const USER_REPOSITORY = Symbol('IUserRepository');
```

### 2️⃣ Use in Domain Service

```typescript
// domain/services/user-validation.service.ts
import { Injectable, Inject } from '@nestjs/common';
import { IUserRepository, USER_REPOSITORY } from '../repositories/user.repository.interface';

@Injectable()
export class UserValidationService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly repo: IUserRepository,
  ) {}

  async isEmailTaken(email: string): Promise<boolean> {
    return await this.repo.findByEmail(email) !== null;
  }
}
```

### 3️⃣ Use in Use Case (Application)

```typescript
// application/use-cases/create-user.use-case.impl.ts
import { Inject, Injectable } from '@nestjs/common';
import { IUserRepository, USER_REPOSITORY } from '../../domain/repositories/user.repository.interface';

@Injectable()
export class CreateUserUseCaseImpl {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly repo: IUserRepository,
  ) {}

  async execute(dto: CreateUserDto) {
    const user = User.create(dto);
    return await this.repo.save(user);
  }
}
```

### 4️⃣ Implement (Infrastructure)

```typescript
// infrastructure/persistence/typeorm/repositories/user-typeorm.repository.ts
import { Injectable } from '@nestjs/common';
import { IUserRepository } from '../../../../domain/repositories/user.repository.interface';

@Injectable()
export class UserTypeormRepository implements IUserRepository {
  async save(user: User): Promise<User> {
    // TypeORM implementation
  }
  
  async findById(id: string): Promise<User | null> {
    // TypeORM implementation
  }
}
```

### 5️⃣ Wire Up (Module)

```typescript
// users.module.ts
import { USER_REPOSITORY } from './domain/repositories/user.repository.interface';
import { UserTypeormRepository } from './infrastructure/persistence/typeorm/repositories/user-typeorm.repository';

@Module({
  providers: [
    {
      provide: USER_REPOSITORY,        // Symbol from domain
      useClass: UserTypeormRepository,  // Implementation from infrastructure
    },
  ],
})
export class UsersModule {}
```

---

## 📋 Checklist - Creating New Module

```
□ 1. Create domain entity
      domain/entities/product.entity.ts

□ 2. Create repository INTERFACE
      domain/repositories/product.repository.interface.ts
      ├── Define IProductRepository interface
      └── Export PRODUCT_REPOSITORY symbol

□ 3. Create use case
      application/use-cases/create-product.use-case.impl.ts
      └── Inject IProductRepository via PRODUCT_REPOSITORY symbol

□ 4. Create repository IMPLEMENTATION
      infrastructure/persistence/typeorm/repositories/
      └── product-typeorm.repository.ts (implements IProductRepository)

□ 5. Wire up in module
      product.module.ts
      └── Provide PRODUCT_REPOSITORY → ProductTypeormRepository
```

---

## 🎓 Common Scenarios

### Scenario 1: "I need to validate if email exists"

**Where?** Domain Service ✅

```typescript
// domain/services/user-validation.service.ts
@Injectable()
export class UserValidationService {
  constructor(
    @Inject(USER_REPOSITORY)  // ✅ From domain/repositories/
    private readonly repo: IUserRepository,
  ) {}

  async isEmailAvailable(email: string): Promise<boolean> {
    const user = await this.repo.findByEmail(email);
    return user === null;
  }
}
```

### Scenario 2: "I need to create a user"

**Where?** Application Use Case ✅

```typescript
// application/use-cases/create-user.use-case.impl.ts
@Injectable()
export class CreateUserUseCaseImpl {
  constructor(
    @Inject(USER_REPOSITORY)  // ✅ From domain/repositories/
    private readonly repo: IUserRepository,
  ) {}

  async execute(dto: CreateUserDto) {
    const user = User.create(dto);
    return await this.repo.save(user);
  }
}
```

### Scenario 3: "I need to save to PostgreSQL"

**Where?** Infrastructure Repository ✅

```typescript
// infrastructure/persistence/typeorm/repositories/user-typeorm.repository.ts
@Injectable()
export class UserTypeormRepository implements IUserRepository {
  constructor(
    @InjectRepository(UserTypeormEntity)
    private readonly ormRepo: Repository<UserTypeormEntity>,
  ) {}

  async save(user: User): Promise<User> {
    const entity = this.mapper.toPersistence(user);
    const saved = await this.ormRepo.save(entity);
    return this.mapper.toDomain(saved);
  }
}
```

---

## 🚫 Common Mistakes

### ❌ DON'T: Define interface in application

```typescript
// application/ports/outbound/user-repository.port.ts
export interface IUserRepository { } // ❌ WRONG!
```

### ✅ DO: Define interface in domain

```typescript
// domain/repositories/user.repository.interface.ts
export interface IUserRepository { } // ✅ CORRECT!
```

---

### ❌ DON'T: Import from infrastructure in domain

```typescript
// domain/services/user-validation.service.ts
import { UserTypeormRepository } from '../../infrastructure/...'; // ❌ WRONG!
```

### ✅ DO: Import interface from domain

```typescript
// domain/services/user-validation.service.ts
import { IUserRepository } from '../repositories/user.repository.interface'; // ✅ CORRECT!
```

---

### ❌ DON'T: Use concrete class in constructor

```typescript
constructor(
  private readonly repo: UserTypeormRepository, // ❌ WRONG!
) {}
```

### ✅ DO: Use interface with @Inject decorator

```typescript
constructor(
  @Inject(USER_REPOSITORY)
  private readonly repo: IUserRepository, // ✅ CORRECT!
) {}
```

---

## 🎯 The Golden Rules

1. **Repository Interface** → `domain/repositories/` ⭐
2. **Repository Implementation** → `infrastructure/persistence/` ⭐
3. **Domain defines WHAT** → Interface
4. **Infrastructure defines HOW** → Implementation
5. **Application orchestrates** → Uses interface
6. **Always use @Inject** → With symbol from domain

---

## 📚 Full Documentation

- **`WHAT-WAS-FIXED.md`** - Summary of changes
- **`ARCHITECTURE-DECISION.md`** - Visual diagrams & rationale
- **`REPOSITORY-PATTERN-CLARIFICATION.md`** - Deep dive
- **`DDD-HEXAGONAL-GUIDE.md`** - Complete guide
- **`QUICK-REFERENCE.md`** - This file! ⭐

---

## ✨ Remember

```
┌─────────────────────────────────────────────────────┐
│  Interface in DOMAIN = SOURCE OF TRUTH              │
│  Implementation in INFRASTRUCTURE = TECHNICAL CODE  │
│  Usage in APPLICATION = ORCHESTRATION               │
└─────────────────────────────────────────────────────┘
```

**This is the standard. It won't change!** 🎯

---

**Print this out and keep it next to your desk!** 📋
