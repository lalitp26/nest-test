# DDD + Hexagonal + CQRS Architecture Guide

## 📌 About This Document

This guide provides comprehensive folder structures and rules for implementing:
- **DDD (Domain-Driven Design)** - Business-focused architecture
- **Hexagonal Architecture (Ports & Adapters)** - Dependency inversion
- **CQRS (Command Query Responsibility Segregation)** - Read/Write separation

**✅ This repository uses: DDD + Hexagonal Architecture (Section 1)**  
**📖 For CQRS patterns, see Sections 2 & 3**

---

## Table of Contents
1. [DDD + Hexagonal Folder Structure](#1-ddd--hexagonal-folder-structure) ⭐ **Current Structure**
2. [CQRS Folder Structure](#2-cqrs-folder-structure)
3. [DDD + Hexagonal + CQRS Combined Structure](#3-ddd--hexagonal--cqrs-combined-structure)
4. [Rules to Follow in DDD + Hexagonal](#4-rules-to-follow-in-ddd--hexagonal)
5. [Rules to Decide What to Put Where](#5-rules-to-decide-what-to-put-where)

---

## 1. DDD + Hexagonal Folder Structure

### ⭐ Recommended Structure (Industry Standard - Used in This Repository)

```
src/
└── modules/
    └── [bounded-context]/          # e.g., orders, users, payments
        │
        ├── domain/                  # ===== DOMAIN LAYER (Core Business Logic) =====
        │   │                       # ✅ NO framework dependencies
        │   │                       # ✅ NO infrastructure imports
        │   │                       # ✅ Pure business logic only
        │   │
        │   ├── entities/           # Domain entities with business logic
        │   │   └── order.entity.ts
        │   │
        │   ├── value-objects/      # Immutable value objects
        │   │   ├── email.vo.ts
        │   │   └── order-item.vo.ts
        │   │
        │   ├── repositories/       # ⭐ Repository INTERFACES (not implementations!)
        │   │   ├── order.repository.interface.ts
        │   │   └── index.ts
        │   │   # ✅ This is where repository interfaces belong!
        │   │   # Domain defines WHAT it needs for persistence
        │   │   # Infrastructure implements HOW to persist
        │   │
        │   ├── services/           # Domain services (complex business logic)
        │   │   ├── order-validation.service.ts
        │   │   └── index.ts
        │   │   # Can inject repository interfaces when validation needs DB access
        │   │
        │   ├── events/             # Domain events (things that happened)
        │   │   ├── order-created.event.ts
        │   │   ├── order-status-changed.event.ts
        │   │   └── index.ts
        │   │
        │   └── exceptions/         # (Optional) Domain-specific exceptions
        │       └── order-cannot-be-modified.exception.ts
        │
        ├── application/             # ===== APPLICATION LAYER (Use Cases) =====
        │   │                       # ✅ Orchestrates domain objects
        │   │                       # ✅ Manages transactions
        │   │                       # ✅ No business logic here!
        │   │
        │   ├── use-cases/          # Use case implementations
        │   │   ├── create-order.use-case.impl.ts
        │   │   ├── get-order.use-case.impl.ts
        │   │   └── index.ts
        │   │
        │   ├── dto/                # Data Transfer Objects (API contracts)
        │   │   ├── create-order.dto.ts
        │   │   ├── update-order.dto.ts
        │   │   ├── order-response.dto.ts
        │   │   └── index.ts
        │   │
        │   ├── mappers/            # Domain ↔ DTO transformations
        │   │   ├── order.mapper.ts
        │   │   └── index.ts
        │   │
        │   └── ports/              # Hexagonal Architecture Ports
        │       ├── inbound/        # Input ports (use case interfaces)
        │       │   ├── create-order.use-case.ts
        │       │   ├── get-order.use-case.ts
        │       │   └── index.ts
        │       └── outbound/       # Output ports (external service interfaces)
        │           ├── order-repository.port.ts  # Re-exports from domain
        │           ├── notification.port.ts      # External services (NOT repos)
        │           └── index.ts
        │
        └── infrastructure/          # ===== INFRASTRUCTURE LAYER (Adapters) =====
            │                       # ✅ Framework-specific code
            │                       # ✅ Database, HTTP, external APIs
            │                       # ✅ Implements interfaces from domain/application
            │
            ├── adapters/           # Hexagonal Adapters
            │   │
            │   ├── inbound/       # PRIMARY/DRIVING Adapters (receive requests)
            │   │   ├── http/      # REST API Controllers
            │   │   │   ├── orders.controller.ts
            │   │   │   └── index.ts
            │   │   ├── graphql/   # (Optional) GraphQL Resolvers
            │   │   └── cli/       # (Optional) CLI Commands
            │   │
            │   └── outbound/      # SECONDARY/DRIVEN Adapters (external integrations)
            │       ├── notification/
            │       │   ├── email-notification.adapter.ts
            │       │   └── index.ts
            │       ├── payment/   # (Optional) External payment services
            │       └── messaging/ # (Optional) Message queue publishers
            │
            └── persistence/        # Database Layer
                └── typeorm/       # ORM-specific (can be prisma, mongoose, etc.)
                    │
                    ├── entities/  # ORM/Database entities
                    │   ├── order.typeorm-entity.ts
                    │   └── index.ts
                    │
                    ├── mappers/   # Domain ↔ ORM transformations
                    │   ├── order-typeorm.mapper.ts
                    │   └── index.ts
                    │
                    └── repositories/  # ⭐ Repository IMPLEMENTATIONS
                        ├── order-typeorm.repository.ts
                        └── index.ts
                        # ✅ Implements interfaces from domain/repositories/

```

### Key Points About This Structure

**✅ Repository Pattern Location (CRITICAL!):**
```
domain/repositories/           ← Interface defined here (WHAT domain needs)
infrastructure/persistence/    ← Implementation here (HOW to persist)
application/ports/outbound/    ← (Optional) Re-exports from domain for convenience
```

**✅ Why This Works:**
- Domain defines WHAT it needs (interface)
- Infrastructure implements HOW to do it (concrete class)
- Application uses the domain interface
- Domain Services can inject repository interfaces
- Follows Dependency Inversion Principle

---

### 📝 Complete Real-World Example: Orders Module

Here's exactly how this structure looks when fully implemented:

**Key Files with Code Snippets:**

1. **Domain Repository Interface** (`domain/repositories/order.repository.interface.ts`)
   ```typescript
   export interface IOrderRepository {
     save(order: Order): Promise<Order>;
     findById(id: string): Promise<Order | null>;
   }
   export const ORDER_REPOSITORY = Symbol('IOrderRepository');
   ```

2. **Infrastructure Implementation** (`infrastructure/persistence/typeorm/repositories/order-typeorm.repository.ts`)
   ```typescript
   @Injectable()
   export class OrderTypeormRepository implements IOrderRepository {
     constructor(@InjectRepository(OrderTypeormEntity) private repo: Repository<OrderTypeormEntity>) {}
     
     async save(order: Order): Promise<Order> {
       const ormEntity = OrderTypeormMapper.toPersistence(order);
       const saved = await this.repo.save(ormEntity);
       return OrderTypeormMapper.toDomain(saved);
     }
   }
   ```

3. **Module Dependency Injection** (`orders.module.ts`)
   ```typescript
   @Module({
     providers: [
       {
         provide: ORDER_REPOSITORY,        // Symbol from domain
         useClass: OrderTypeormRepository, // Implementation from infrastructure
       },
       CreateOrderUseCaseImpl,
     ],
   })
   export class OrdersModule {}
   ```

4. **Use Case Consuming Repository** (`application/use-cases/create-order.use-case.impl.ts`)
   ```typescript
   @Injectable()
   export class CreateOrderUseCaseImpl implements ICreateOrderUseCase {
     constructor(@Inject(ORDER_REPOSITORY) private repo: IOrderRepository) {}
     
     async execute(dto: CreateOrderDto): Promise<OrderResponseDto> {
       const order = Order.create(dto.userId, dto.items);
       const saved = await this.repo.save(order);
       return OrderMapper.toDto(saved);
     }
   }
   ```

**Complete Folder Tree:**
```
src/modules/orders/
├── domain/
│   ├── entities/order.entity.ts              # Business logic (addItem, confirm, ship)
│   ├── value-objects/order-item.vo.ts        # Immutable OrderItem
│   ├── repositories/order.repository.interface.ts  # ⭐ Interface (WHAT)
│   ├── services/order-validation.service.ts  # Can inject IOrderRepository
│   └── events/order-created.event.ts
├── application/
│   ├── use-cases/create-order.use-case.impl.ts
│   ├── dto/create-order.dto.ts
│   ├── mappers/order.mapper.ts
│   └── ports/
│       ├── inbound/create-order.use-case.ts  # Use case interface
│       └── outbound/order-repository.port.ts # Re-exports from domain
├── infrastructure/
│   ├── adapters/inbound/http/orders.controller.ts
│   └── persistence/typeorm/
│       ├── entities/order.typeorm-entity.ts  # @Entity decorator
│       ├── mappers/order-typeorm.mapper.ts   # Domain ↔ ORM
│       └── repositories/order-typeorm.repository.ts  # ⭐ Implementation (HOW)
└── orders.module.ts
```

This exact structure is implemented in this repository - check the files to see the full code!

---

### Alternative Popular Structure (Vertical Slicing)

```
src/
└── [bounded-context]/
    ├── core/                       # Domain + Application
    │   ├── domain/
    │   └── application/
    └── infrastructure/             # All infrastructure concerns
```

---

## 2. CQRS Folder Structure

### Most Common Structure

```
src/
└── modules/
    └── [feature]/
        ├── commands/                # Write side
        │   ├── handlers/           # Command handlers
        │   ├── impl/               # Command implementations
        │   └── validators/         # Command validators
        │
        ├── queries/                 # Read side
        │   ├── handlers/           # Query handlers
        │   ├── impl/               # Query implementations
        │   └── dto/                # Read models / DTOs
        │
        ├── events/                  # Domain events
        │   ├── handlers/           # Event handlers
        │   └── impl/               # Event implementations
        │
        ├── sagas/                   # Process managers (optional)
        │   └── handlers/
        │
        ├── domain/                  # Domain models (write side)
        │   ├── models/
        │   └── repositories/
        │
        ├── read-models/             # Denormalized read models
        │   ├── schemas/            # Read model schemas
        │   └── repositories/       # Read model repositories
        │
        └── controllers/             # API endpoints
```

### Alternative Structure (Command/Query Separation at Top)

```
src/
└── [feature]/
    ├── write-side/                 # Command side
    │   ├── commands/
    │   ├── domain/
    │   └── repositories/
    │
    └── read-side/                  # Query side
        ├── queries/
        ├── projections/
        └── read-models/
```

---

## 3. DDD + Hexagonal + CQRS Combined Structure

### Most Comprehensive Structure (Industry Standard)

```
src/
└── modules/
    └── [bounded-context]/          # e.g., orders, users, billing
        │
        ├── domain/                  # ===== DOMAIN LAYER (Core Business Logic) =====
        │   ├── aggregates/         # Aggregate roots (consistency boundaries)
        │   │   └── order.aggregate.ts
        │   ├── entities/           # Domain entities
        │   │   └── order-item.entity.ts
        │   ├── value-objects/      # Immutable values
        │   │   ├── money.vo.ts
        │   │   └── order-status.vo.ts
        │   ├── events/             # Domain events
        │   │   ├── order-created.event.ts
        │   │   └── order-cancelled.event.ts
        │   ├── repositories/       # Repository interfaces (ports)
        │   │   ├── order.repository.interface.ts
        │   │   └── order-read.repository.interface.ts
        │   ├── services/           # Domain services
        │   │   └── order-pricing.service.ts
        │   ├── specifications/     # Business rules
        │   │   └── order-can-be-cancelled.spec.ts
        │   └── exceptions/         # Domain exceptions
        │       └── order-cannot-be-modified.exception.ts
        │
        ├── application/             # ===== APPLICATION LAYER (Use Cases) =====
        │   │
        │   ├── commands/           # WRITE SIDE (CQRS)
        │   │   ├── handlers/       # Command handlers
        │   │   │   ├── create-order.handler.ts
        │   │   │   ├── cancel-order.handler.ts
        │   │   │   └── update-order.handler.ts
        │   │   ├── impl/           # Command DTOs
        │   │   │   ├── create-order.command.ts
        │   │   │   └── cancel-order.command.ts
        │   │   └── validators/     # Command validation
        │   │       └── create-order.validator.ts
        │   │
        │   ├── queries/            # READ SIDE (CQRS)
        │   │   ├── handlers/       # Query handlers
        │   │   │   ├── get-order.handler.ts
        │   │   │   └── list-orders.handler.ts
        │   │   ├── impl/           # Query DTOs
        │   │   │   ├── get-order.query.ts
        │   │   │   └── list-orders.query.ts
        │   │   └── dto/            # Response DTOs (read models)
        │   │       ├── order.dto.ts
        │   │       └── order-list.dto.ts
        │   │
        │   ├── events/             # Event handlers (Application level)
        │   │   ├── handlers/
        │   │   │   ├── on-order-created.handler.ts
        │   │   │   └── on-order-cancelled.handler.ts
        │   │   └── sagas/          # Process managers/Sagas
        │   │       └── order-fulfillment.saga.ts
        │   │
        │   ├── ports/              # Ports (Hexagonal Architecture)
        │   │   ├── in/            # Input/Driving ports
        │   │   │   ├── create-order.use-case.ts
        │   │   │   └── get-order.use-case.ts
        │   │   └── out/           # Output/Driven ports
        │   │       ├── order.repository.port.ts
        │   │       ├── payment.service.port.ts
        │   │       └── notification.service.port.ts
        │   │
        │   ├── mappers/            # Domain ↔ DTO mappers
        │   │   └── order.mapper.ts
        │   │
        │   └── services/           # Application services
        │       └── order-orchestration.service.ts
        │
        ├── infrastructure/          # ===== INFRASTRUCTURE LAYER (Adapters) =====
        │   │
        │   ├── adapters/           # Hexagonal Adapters
        │   │   │
        │   │   ├── primary/       # DRIVING ADAPTERS (Input)
        │   │   │   ├── rest/      # REST API
        │   │   │   │   ├── controllers/
        │   │   │   │   │   ├── order.controller.ts
        │   │   │   │   │   └── order-query.controller.ts
        │   │   │   │   └── dto/
        │   │   │   │       ├── create-order.request.ts
        │   │   │   │       └── order.response.ts
        │   │   │   │
        │   │   │   ├── graphql/   # GraphQL API
        │   │   │   │   ├── resolvers/
        │   │   │   │   └── types/
        │   │   │   │
        │   │   │   ├── grpc/      # gRPC API
        │   │   │   │   └── order.proto.ts
        │   │   │   │
        │   │   │   └── messaging/ # Message consumers
        │   │   │       └── order-command.consumer.ts
        │   │   │
        │   │   └── secondary/     # DRIVEN ADAPTERS (Output)
        │   │       ├── repositories/  # Repository implementations
        │   │       │   ├── order.repository.ts
        │   │       │   └── order-read.repository.ts
        │   │       ├── external-services/  # 3rd party integrations
        │   │       │   ├── payment.service.ts
        │   │       │   └── notification.service.ts
        │   │       └── messaging/  # Message producers
        │   │           └── event-publisher.ts
        │   │
        │   ├── persistence/        # Database layer
        │   │   │
        │   │   ├── write-side/    # Write database (normalized)
        │   │   │   ├── entities/  # ORM entities
        │   │   │   │   ├── order.orm-entity.ts
        │   │   │   │   └── order-item.orm-entity.ts
        │   │   │   ├── repositories/
        │   │   │   │   └── order.repository.impl.ts
        │   │   │   └── migrations/
        │   │   │
        │   │   ├── read-side/     # Read database (denormalized)
        │   │   │   ├── schemas/   # Read model schemas
        │   │   │   │   └── order-view.schema.ts
        │   │   │   ├── repositories/
        │   │   │   │   └── order-read.repository.impl.ts
        │   │   │   └── projections/ # Event projections
        │   │   │       └── order.projection.ts
        │   │   │
        │   │   └── mappers/       # ORM ↔ Domain mappers
        │   │       └── order.persistence.mapper.ts
        │   │
        │   └── config/            # Module configuration
        │       └── order.config.ts
        │
        └── orders.module.ts        # NestJS Module

```

### Simplified Combined Structure (For Smaller Projects)

```
src/
└── [bounded-context]/
    ├── domain/                     # Domain layer
    │   ├── aggregates/
    │   ├── entities/
    │   ├── value-objects/
    │   ├── events/
    │   └── repositories/          # Interfaces
    │
    ├── application/                # Application layer
    │   ├── commands/              # CQRS write
    │   ├── queries/               # CQRS read
    │   ├── events/                # Event handlers
    │   └── ports/                 # Hexagonal ports
    │
    └── infrastructure/             # Infrastructure layer
        ├── controllers/           # Primary adapters
        ├── repositories/          # Secondary adapters
        └── persistence/           # Database
```

---

## 4. Rules to Follow in DDD + Hexagonal

### Core Principles

#### 1. **Dependency Rule (Most Important)**
```
Infrastructure → Application → Domain
       ↓              ↓           ↑
    Adapters    Use Cases    Core Logic
                                (NO dependencies)
```
- **Domain layer** has NO dependencies on other layers
- **Application layer** depends only on Domain
- **Infrastructure layer** depends on Application and Domain
- Dependencies point INWARD only

#### 2. **Domain Layer Rules**

**DO:**
- ✅ Contain pure business logic
- ✅ Use ubiquitous language from domain experts
- ✅ Enforce business rules and invariants
- ✅ Define interfaces (ports) for external dependencies
- ✅ Raise domain events for significant state changes
- ✅ Keep entities and aggregates rich with behavior
- ✅ Make value objects immutable

**DON'T:**
- ❌ Import framework-specific code (NestJS, Express, etc.)
- ❌ Import infrastructure concerns (database, HTTP, etc.)
- ❌ Know about DTOs, controllers, or repositories implementations
- ❌ Depend on external libraries (except pure utility libraries)
- ❌ Have setters for every property (use methods with business meaning)
- ❌ Expose internal state unnecessarily

#### 3. **Application Layer Rules**

**DO:**
- ✅ Orchestrate domain objects
- ✅ Define use cases (commands/queries)
- ✅ Handle transactions
- ✅ Convert between domain and DTOs
- ✅ Define ports (interfaces) for infrastructure
- ✅ Coordinate domain events
- ✅ Implement authorization logic

**DON'T:**
- ❌ Contain business logic (belongs in domain)
- ❌ Directly use infrastructure implementations
- ❌ Know about HTTP, databases, or external APIs
- ❌ Bypass domain layer and manipulate persistence directly

#### 4. **Infrastructure Layer Rules**

**DO:**
- ✅ Implement application ports (interfaces)
- ✅ Handle framework-specific code
- ✅ Manage database access and ORM
- ✅ Implement external API clients
- ✅ Handle HTTP requests/responses
- ✅ Map between domain and persistence models
- ✅ Configure dependency injection

**DON'T:**
- ❌ Contain business logic
- ❌ Bypass application layer to call domain directly (usually)
- ❌ Mix different adapter concerns

#### 5. **Hexagonal Architecture Specific Rules**

**Primary (Driving) Adapters:**
- REST Controllers
- GraphQL Resolvers
- CLI Commands
- Message Consumers
- gRPC Services
- **Purpose:** Convert external requests to use case calls

**Secondary (Driven) Adapters:**
- Repository Implementations
- External API Clients
- Email Services
- File System Access
- Message Publishers
- **Purpose:** Implement ports defined by application layer

#### 6. **Ports & Adapters Rules**

**Port (Interface) Rules:**
- Define in Domain or Application layer
- Must be independent of implementation
- Should represent business concepts, not technical ones
- Named from business perspective (e.g., `OrderRepository`, not `DatabaseConnection`)

**Adapter (Implementation) Rules:**
- Live in Infrastructure layer
- Can use any framework/library needed
- Can have multiple implementations of same port
- Should be easily swappable

#### 7. **Aggregate Rules**

**DO:**
- ✅ Keep aggregates small (single responsibility)
- ✅ Reference other aggregates by ID only
- ✅ Ensure consistency within aggregate boundary
- ✅ One repository per aggregate
- ✅ Modify aggregate only through its root
- ✅ Load entire aggregate at once

**DON'T:**
- ❌ Nest aggregates within aggregates
- ❌ Hold references to other aggregate instances
- ❌ Modify child entities directly from outside
- ❌ Create huge aggregates with many entities

#### 8. **Transaction Rules**

- One transaction per use case (command handler)
- Transaction boundary = aggregate boundary
- Use eventual consistency between aggregates
- Application layer manages transactions, not domain

#### 9. **Testing Rules**

**Domain Layer:**
- Unit tests only
- No mocks needed (pure business logic)
- Test all business rules and invariants

**Application Layer:**
- Unit tests with mocked ports
- Test use case orchestration
- Test domain event handling

**Infrastructure Layer:**
- Integration tests
- Test adapters against real dependencies
- Test repository implementations with real database

---

## 5. Rules to Decide What to Put Where

### Decision Tree

#### Is it Business Logic?
```
YES → Domain Layer
  ├─ Is it a thing with identity? → Entity
  ├─ Is it a value without identity? → Value Object
  ├─ Is it a consistency boundary? → Aggregate
  ├─ Is it a business rule involving multiple objects? → Domain Service
  ├─ Is it something that happened? → Domain Event
  └─ Is it a data access interface? → Repository Interface

NO → Continue...
```

#### Is it a Use Case or Orchestration?
```
YES → Application Layer
  ├─ Is it a write operation? → Command Handler
  ├─ Is it a read operation? → Query Handler
  ├─ Does it react to events? → Event Handler
  ├─ Is it a long-running process? → Saga
  ├─ Does it define required external service? → Output Port (interface)
  └─ Does it convert data formats? → Mapper

NO → Continue...
```

#### Is it Technical Implementation?
```
YES → Infrastructure Layer
  ├─ Does it receive external requests? → Primary Adapter (Controller)
  ├─ Does it implement data access? → Repository Implementation
  ├─ Does it call external APIs? → External Service Adapter
  ├─ Does it handle database mapping? → ORM Entity / Persistence Mapper
  └─ Does it configure framework? → Module / Configuration

NO → Continue...
```

### Specific Component Placement

#### Entities
**Location:** `domain/entities/` or `domain/aggregates/`

**Put here if:**
- Has unique identity
- Has lifecycle (created, modified, deleted)
- Contains business behavior
- State changes are significant

**Example:**
```typescript
// domain/entities/order.entity.ts
export class Order extends BaseEntity {
  private items: OrderItem[];
  private status: OrderStatus;
  
  cancel(): void {
    if (!this.canBeCancelled()) {
      throw new OrderCannotBeCancelledException();
    }
    this.status = OrderStatus.CANCELLED;
    this.addDomainEvent(new OrderCancelledEvent(this.id));
  }
}
```

#### Value Objects
**Location:** `domain/value-objects/`

**Put here if:**
- No unique identity
- Immutable
- Compared by value, not reference
- Represents a concept from domain

**Example:**
```typescript
// domain/value-objects/money.vo.ts
export class Money extends ValueObject {
  constructor(
    public readonly amount: number,
    public readonly currency: string
  ) {
    super();
    this.validate();
  }
}
```

#### Aggregates
**Location:** `domain/aggregates/`

**Put here if:**
- Is a root entity that controls consistency boundary
- Has child entities that only make sense with it
- Needs to maintain invariants across multiple entities

**Example:**
```typescript
// domain/aggregates/order.aggregate.ts
export class OrderAggregate extends AggregateRoot {
  private items: OrderItem[];
  
  addItem(item: OrderItem): void {
    // Enforce business rule across aggregate
    if (this.items.length >= MAX_ITEMS) {
      throw new TooManyItemsException();
    }
    this.items.push(item);
  }
}
```

#### Domain Services
**Location:** `domain/services/`

**Put here if:**
- Business logic doesn't naturally belong to single entity
- Requires multiple entities/value objects
- Still pure domain logic (no infrastructure)

**Example:**
```typescript
// domain/services/order-pricing.service.ts
export class OrderPricingService {
  calculateTotal(order: Order, customer: Customer): Money {
    // Complex pricing logic involving multiple aggregates
  }
}
```

#### Repositories (Interfaces)
**Location:** `domain/repositories/` or `application/ports/out/`

**Put here if:**
- Defines how to persist/retrieve aggregates
- Is an abstraction (interface), not implementation

**Example:**
```typescript
// domain/repositories/order.repository.ts
export interface OrderRepository {
  save(order: Order): Promise<void>;
  findById(id: OrderId): Promise<Order | null>;
  findByCustomerId(customerId: CustomerId): Promise<Order[]>;
}
```

#### Command Handlers
**Location:** `application/commands/handlers/`

**Put here if:**
- Handles write operation (changes state)
- Orchestrates domain objects
- Manages transaction

**Example:**
```typescript
// application/commands/handlers/create-order.handler.ts
@CommandHandler(CreateOrderCommand)
export class CreateOrderHandler {
  async execute(command: CreateOrderCommand): Promise<OrderId> {
    // 1. Load necessary aggregates
    // 2. Execute domain logic
    // 3. Save changes
    // 4. Publish events
  }
}
```

#### Query Handlers
**Location:** `application/queries/handlers/`

**Put here if:**
- Handles read operation (no state change)
- May bypass domain model for performance
- Returns DTOs

**Example:**
```typescript
// application/queries/handlers/get-order.handler.ts
@QueryHandler(GetOrderQuery)
export class GetOrderHandler {
  async execute(query: GetOrderQuery): Promise<OrderDto> {
    // Read optimized data, return DTO
  }
}
```

#### Controllers
**Location:** `infrastructure/adapters/primary/rest/controllers/`

**Put here if:**
- Handles HTTP requests
- Validates input
- Calls use cases
- Returns HTTP responses

**Example:**
```typescript
// infrastructure/adapters/primary/rest/controllers/order.controller.ts
@Controller('orders')
export class OrderController {
  @Post()
  async create(@Body() dto: CreateOrderRequest): Promise<OrderResponse> {
    const command = new CreateOrderCommand(dto);
    const orderId = await this.commandBus.execute(command);
    return { orderId };
  }
}
```

#### Repository Implementations
**Location:** `infrastructure/adapters/secondary/repositories/` or `infrastructure/persistence/repositories/`

**Put here if:**
- Implements repository interface
- Uses ORM or database access
- Maps between domain and persistence models

**Example:**
```typescript
// infrastructure/persistence/repositories/order.repository.impl.ts
@Injectable()
export class OrderRepositoryImpl implements OrderRepository {
  async save(order: Order): Promise<void> {
    const ormEntity = this.mapper.toOrmEntity(order);
    await this.ormRepository.save(ormEntity);
  }
}
```

#### DTOs
**Location:** 
- Request DTOs: `infrastructure/adapters/primary/rest/dto/`
- Response DTOs: `application/queries/dto/` or `application/dto/`
- Internal DTOs: `application/dto/`

**Put here if:**
- Transfers data between layers
- Represents API contract
- Used for serialization

#### Mappers
**Location:**
- Domain ↔ DTO: `application/mappers/`
- Domain ↔ Persistence: `infrastructure/persistence/mappers/`

**Put here if:**
- Converts between different models
- Handles data transformation

#### Events
**Location:**
- Domain Events: `domain/events/`
- Integration Events: `application/events/` or `infrastructure/messaging/events/`

**Domain Events:**
```typescript
// domain/events/order-created.event.ts
export class OrderCreatedEvent extends DomainEvent {
  constructor(public readonly orderId: OrderId) {
    super();
  }
}
```

**Event Handlers:**
```typescript
// application/events/handlers/on-order-created.handler.ts
@EventHandler(OrderCreatedEvent)
export class OnOrderCreatedHandler {
  async handle(event: OrderCreatedEvent): Promise<void> {
    // React to domain event
  }
}
```

### Quick Reference Table

| Component | Layer | Folder |
|-----------|-------|--------|
| Entity | Domain | `domain/entities/` |
| Value Object | Domain | `domain/value-objects/` |
| Aggregate | Domain | `domain/aggregates/` |
| Domain Service | Domain | `domain/services/` |
| Domain Event | Domain | `domain/events/` |
| Repository Interface | Domain | `domain/repositories/` |
| Specification | Domain | `domain/specifications/` |
| Domain Exception | Domain | `domain/exceptions/` |
| Command | Application | `application/commands/impl/` |
| Command Handler | Application | `application/commands/handlers/` |
| Query | Application | `application/queries/impl/` |
| Query Handler | Application | `application/queries/handlers/` |
| Event Handler | Application | `application/events/handlers/` |
| Saga | Application | `application/events/sagas/` |
| Use Case Interface (Port) | Application | `application/ports/in/` |
| External Service Interface (Port) | Application | `application/ports/out/` |
| Mapper (Domain↔DTO) | Application | `application/mappers/` |
| DTO (Response) | Application | `application/dto/` or `application/queries/dto/` |
| Application Service | Application | `application/services/` |
| REST Controller | Infrastructure | `infrastructure/adapters/primary/rest/controllers/` |
| GraphQL Resolver | Infrastructure | `infrastructure/adapters/primary/graphql/resolvers/` |
| Request DTO | Infrastructure | `infrastructure/adapters/primary/rest/dto/` |
| Repository Implementation | Infrastructure | `infrastructure/persistence/repositories/` |
| ORM Entity | Infrastructure | `infrastructure/persistence/entities/` |
| Persistence Mapper | Infrastructure | `infrastructure/persistence/mappers/` |
| External API Client | Infrastructure | `infrastructure/adapters/secondary/external-services/` |
| Message Publisher | Infrastructure | `infrastructure/adapters/secondary/messaging/` |
| Read Model | Infrastructure | `infrastructure/persistence/read-side/schemas/` |
| Projection | Infrastructure | `infrastructure/persistence/read-side/projections/` |

### Common Mistakes and Solutions

#### ❌ Mistake 1: Putting Business Logic in Controllers
**Wrong:**
```typescript
// infrastructure/controllers/order.controller.ts
@Post()
async create(@Body() dto: CreateOrderRequest) {
  if (dto.quantity <= 0) throw new BadRequestException(); // Business rule!
  // ...
}
```

**Right:**
```typescript
// domain/entities/order.entity.ts
addItem(item: OrderItem): void {
  if (item.quantity <= 0) {
    throw new InvalidQuantityException(); // Domain exception
  }
  // ...
}
```

#### ❌ Mistake 2: Domain Depending on Infrastructure
**Wrong:**
```typescript
// domain/entities/order.entity.ts
import { Entity } from 'typeorm'; // ❌ ORM dependency in domain!

@Entity()
export class Order {
  @PrimaryKey()
  id: string;
}
```

**Right:**
```typescript
// domain/entities/order.entity.ts
export class Order extends BaseEntity {
  constructor(private readonly id: OrderId) {}
}

// infrastructure/persistence/entities/order.orm-entity.ts
import { Entity } from 'typeorm'; // ✅ ORM only in infrastructure

@Entity()
export class OrderOrmEntity {
  @PrimaryKey()
  id: string;
}
```

#### ❌ Mistake 3: Anemic Domain Model
**Wrong:**
```typescript
// domain/entities/order.entity.ts
export class Order {
  status: string; // Just data, no behavior
  items: OrderItem[];
}

// application/services/order.service.ts
class OrderService {
  cancelOrder(order: Order) { // Logic in application layer!
    if (order.status === 'SHIPPED') throw new Error();
    order.status = 'CANCELLED';
  }
}
```

**Right:**
```typescript
// domain/entities/order.entity.ts
export class Order {
  private status: OrderStatus;
  
  cancel(): void { // Behavior in domain!
    if (!this.canBeCancelled()) {
      throw new OrderCannotBeCancelledException();
    }
    this.status = OrderStatus.CANCELLED;
  }
}
```

#### ❌ Mistake 4: Using Implementation in Application Layer
**Wrong:**
```typescript
// application/commands/handlers/create-order.handler.ts
import { OrderRepositoryImpl } from '@infrastructure/repositories'; // ❌

constructor(private repo: OrderRepositoryImpl) {} // Concrete class!
```

**Right:**
```typescript
// application/commands/handlers/create-order.handler.ts
import { OrderRepository } from '@domain/repositories'; // ✅

constructor(private repo: OrderRepository) {} // Interface!
```

---

## Key Takeaways for Implementation

### 1. **Start Simple, Evolve**
- Begin with basic structure
- Add complexity as needed
- Don't over-engineer small projects

### 2. **Consistency Over Perfection**
- Pick a structure and stick to it
- Document team decisions
- Create templates for new modules

### 3. **Test Your Boundaries**
- If domain imports infrastructure → Wrong!
- If application imports concrete implementations → Wrong!
- If infrastructure contains business logic → Wrong!

### 4. **Focus on Business Value**
- Domain layer = Business experts should understand it
- Application layer = Use cases should be obvious
- Infrastructure layer = Technical details hidden here

### 5. **When in Doubt**
- Business logic → Domain
- Orchestration → Application
- Technical details → Infrastructure

---

## Additional Resources

### Recommended Reading
1. **Domain-Driven Design** by Eric Evans (Blue Book)
2. **Implementing Domain-Driven Design** by Vaughn Vernon (Red Book)
3. **Hexagonal Architecture** by Alistair Cockburn
4. **Clean Architecture** by Robert C. Martin
5. **CQRS Journey** by Microsoft patterns & practices

### NestJS Specific
- NestJS CQRS Module Documentation
- NestJS Architecture Best Practices
- TypeORM / Prisma with DDD patterns

---

## 📋 PRINT-READY QUICK REFERENCE CARD

### Layer Rules (Remember This!)
```
┌─────────────────────────────────────────────────────────┐
│  DOMAIN         = WHAT (Business logic & rules)         │
│  APPLICATION    = ORCHESTRATE (Use cases)               │
│  INFRASTRUCTURE = HOW (Technical implementation)        │
└─────────────────────────────────────────────────────────┘

Dependencies flow: Infrastructure → Application → Domain
                   (INWARD ONLY!)
```

### Where Things Go
```
Business Logic?           → domain/entities/ or domain/services/
Repository Interface?     → domain/repositories/ ⭐
Repository Implementation → infrastructure/persistence/repositories/
Use Case?                 → application/use-cases/
Controller?               → infrastructure/adapters/inbound/http/
External Service?         → infrastructure/adapters/outbound/
```

### Golden Rules
```
✅ Domain has NO dependencies on other layers
✅ Repository INTERFACE in domain, IMPLEMENTATION in infrastructure
✅ Domain Services CAN inject repository interfaces
✅ Entities contain business logic (NOT just data)
✅ Use cases orchestrate, don't contain business logic
✅ Controllers are thin, just call use cases

❌ NO business logic in controllers
❌ NO framework imports in domain
❌ NO direct database access in domain
❌ NO implementation imports in application layer
```

### Quick Decision Tree
```
"Where do I put this file?"

Is it business logic?
  → YES: domain/

Is it orchestration?
  → YES: application/

Is it technical/framework code?
  → YES: infrastructure/

Is it a repository?
  → Interface:      domain/repositories/
  → Implementation: infrastructure/persistence/repositories/
```

---

*This guide is designed to be printed and used as a reference. Keep it handy while designing your architecture!*

**Repository:** nest-test  
**Structure Used:** DDD + Hexagonal Architecture (Section 1)  
**Last Updated:** October 24, 2025
