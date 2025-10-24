# Architecture Decision - Repository Pattern Location

## ⚖️ THE CONFUSION

You asked: *"Where should repository interfaces go? Domain or Application?"*

**Answer: DOMAIN LAYER** ✅

But I created them in BOTH places by mistake, causing confusion. Let me explain why DOMAIN is correct.

---

## 🎯 THE CORRECT STRUCTURE (Now Fixed)

```
┌─────────────────────────────────────────────────────────────────┐
│                         DOMAIN LAYER                            │
│                    (Business Logic Core)                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  domain/repositories/user.repository.interface.ts               │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ export interface IUserRepository {                        │ │
│  │   save(user: User): Promise<User>;                        │ │
│  │   findById(id: string): Promise<User | null>;             │ │
│  │ }                                                          │ │
│  │                                                            │ │
│  │ export const USER_REPOSITORY = Symbol('IUserRepository'); │ │
│  └───────────────────────────────────────────────────────────┘ │
│                            ▲                                    │
│                            │                                    │
│                    ✅ SOURCE OF TRUTH                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                             ▲
                             │ implements
                             │
┌────────────────────────────┴────────────────────────────────────┐
│                   INFRASTRUCTURE LAYER                          │
│                  (Technical Implementation)                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  infrastructure/persistence/typeorm/repositories/               │
│  user-typeorm.repository.ts                                     │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ @Injectable()                                             │ │
│  │ export class UserTypeormRepository                        │ │
│  │              implements IUserRepository { // ✅ From domain│ │
│  │   async save(user: User): Promise<User> {                 │ │
│  │     // TypeORM specific code                              │ │
│  │   }                                                        │ │
│  │ }                                                          │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                             ▲
                             │ uses
                             │
┌────────────────────────────┴────────────────────────────────────┐
│                    APPLICATION LAYER                            │
│                      (Use Cases)                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  application/use-cases/create-user.use-case.impl.ts             │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ @Injectable()                                             │ │
│  │ export class CreateUserUseCaseImpl {                      │ │
│  │   constructor(                                            │ │
│  │     @Inject(USER_REPOSITORY) // ✅ Symbol from domain     │ │
│  │     private repo: IUserRepository, // ✅ Interface from   │ │
│  │                                    //    domain           │ │
│  │   ) {}                                                    │ │
│  │ }                                                          │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  application/ports/outbound/user-repository.port.ts             │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ // Just re-exports from domain (optional for convenience)│ │
│  │ export {                                                  │ │
│  │   IUserRepository,                                        │ │
│  │   USER_REPOSITORY                                         │ │
│  │ } from '../../../domain/repositories/...';                │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 💡 WHY Domain Layer?

### Reason 1: Dependency Inversion Principle

**WRONG** ❌ - Traditional Layered Architecture:
```
Domain Layer
    ↓ (depends on)
Infrastructure Layer (Database)
```
Problem: Domain is coupled to infrastructure!

**CORRECT** ✅ - Hexagonal Architecture:
```
Infrastructure Layer (implements) 
    ↓ 
Domain Layer (defines interface)
```
Solution: Infrastructure depends on domain, not the other way!

### Reason 2: Domain Services Need Repositories

```typescript
// domain/services/user-validation.service.ts
@Injectable()
export class UserValidationService {
  constructor(
    @Inject(USER_REPOSITORY)  // ✅ Can inject because interface is in domain
    private readonly userRepository: IUserRepository,
  ) {}

  // Business rule that needs data access
  async isEmailAlreadyTaken(email: string): Promise<boolean> {
    const existingUser = await this.userRepository.findByEmail(email);
    return existingUser !== null;
  }
}
```

If the interface was in application layer, domain couldn't use it!

### Reason 3: Pure Domain Logic

Domain layer defines:
- WHAT entities exist (User, Order)
- WHAT operations are needed (save, find, delete)
- WHAT business rules apply (validation, state transitions)

Infrastructure layer defines:
- HOW to store data (SQL, MongoDB, Files)
- HOW to connect to database
- HOW to map between domain and persistence models

---

## 🔄 THE FLOW

### When Domain Service Needs Data:

```typescript
1. Domain Service
   ├── Needs to check if email exists
   └── Injects IUserRepository (from domain/repositories)
       
2. Domain Interface (Contract)
   ├── Defines: findByEmail(email: string)
   └── Lives in: domain/repositories/user.repository.interface.ts

3. Infrastructure Implementation
   ├── Implements IUserRepository
   ├── Uses TypeORM/Prisma/etc.
   └── Lives in: infrastructure/persistence/.../user-typeorm.repository.ts

4. NestJS Module
   ├── Binds: USER_REPOSITORY symbol → UserTypeormRepository class
   └── Injects implementation wherever USER_REPOSITORY is needed
```

### When Use Case Needs Data:

```typescript
1. Use Case (Application Layer)
   ├── Needs to save a user
   └── Injects IUserRepository (from domain/repositories)
       
2. Same flow as above...
```

---

## 📋 CHECKLIST - Where Things Go

### ✅ DOMAIN LAYER (`domain/`)
- [x] Entities (`User`, `Order`)
- [x] Value Objects (`Email`, `Money`)
- [x] Domain Events (`UserCreated`, `OrderPlaced`)
- [x] **Repository Interfaces** ⭐ (`IUserRepository`, `IOrderRepository`)
- [x] Domain Services (`UserValidationService`)
- [x] Business Rules & Validation

### ✅ APPLICATION LAYER (`application/`)
- [x] Use Cases (`CreateUserUseCase`, `PlaceOrderUseCase`)
- [x] DTOs (`CreateUserDto`, `UserResponseDto`)
- [x] Mappers (Domain ↔ DTO)
- [x] Inbound Ports (Use case interfaces)
- [x] Outbound Ports (External service interfaces like `IEmailService`)
  - Can re-export repository interfaces from domain (optional)

### ✅ INFRASTRUCTURE LAYER (`infrastructure/`)
- [x] **Repository Implementations** ⭐ (`UserTypeormRepository`)
- [x] Controllers (REST API)
- [x] ORM Entities (`UserTypeormEntity`)
- [x] External Service Adapters (`EmailServiceAdapter`)
- [x] Database Mappers (Domain ↔ ORM)

---

## 🎓 PRACTICAL EXAMPLE

### Scenario: Creating a User

**1. Controller receives request** (Infrastructure)
```typescript
@Post()
create(@Body() dto: CreateUserDto) {
  return this.createUserUseCase.execute(dto);
}
```

**2. Use Case orchestrates** (Application)
```typescript
@Injectable()
export class CreateUserUseCaseImpl {
  constructor(
    @Inject(USER_REPOSITORY) // ⬅️ Symbol from DOMAIN
    private readonly userRepository: IUserRepository, // ⬅️ Interface from DOMAIN
  ) {}

  async execute(dto: CreateUserDto) {
    // Business logic
    const user = User.create(dto.email, dto.password);
    
    // Save using repository (which interface?)
    // Answer: IUserRepository from domain/repositories/
    const saved = await this.userRepository.save(user);
    
    return this.mapper.toDto(saved);
  }
}
```

**3. Repository saves to database** (Infrastructure)
```typescript
@Injectable()
export class UserTypeormRepository implements IUserRepository { // ⬅️ From DOMAIN
  async save(user: User): Promise<User> {
    // TypeORM specific code
    const entity = this.mapper.toPersistence(user);
    const saved = await this.ormRepository.save(entity);
    return this.mapper.toDomain(saved);
  }
}
```

**4. Module binds everything together**
```typescript
@Module({
  providers: [
    {
      provide: USER_REPOSITORY, // ⬅️ Symbol from DOMAIN
      useClass: UserTypeormRepository, // ⬅️ Implementation from INFRASTRUCTURE
    },
  ],
})
```

---

## 🔑 KEY TAKEAWAYS

1. **Repository Interface** = DOMAIN layer ✅
2. **Repository Implementation** = INFRASTRUCTURE layer ✅
3. **Use Case** injects interface from DOMAIN ✅
4. **Domain Service** can inject interface from DOMAIN ✅
5. **Application ports** can re-export (optional) ✅
6. **Infrastructure** implements the domain interface ✅

---

## 🚀 NOW YOU HAVE

✅ **One source of truth** - Repository interfaces in domain  
✅ **Clear separation** - Domain defines, Infrastructure implements  
✅ **No confusion** - Application ports just re-export  
✅ **Testability** - Easy to mock interfaces  
✅ **Flexibility** - Easy to swap implementations  

---

## 📚 FILES CHANGED

1. ✅ `domain/repositories/user.repository.interface.ts` - Added interface + symbol
2. ✅ `domain/repositories/order.repository.interface.ts` - Added interface + symbol
3. ✅ `application/ports/outbound/user-repository.port.ts` - Now just re-exports
4. ✅ `application/ports/outbound/order-repository.port.ts` - Now just re-exports
5. ✅ `domain/services/*.service.ts` - Added examples of using repositories

**No duplicate interfaces anymore!** 🎉

---

**This is the STANDARD approach in DDD + Hexagonal Architecture. It won't change!** 🎯
