# DDD + Hexagonal Architecture - NestJS Implementation

## 📋 Table of Contents
- [Overview](#overview)
- [Architecture Principles](#architecture-principles)
- [Folder Structure](#folder-structure)
- [Layer Descriptions](#layer-descriptions)
- [Implementation Examples](#implementation-examples)
- [Best Practices](#best-practices)
- [Dependencies](#dependencies)

## 🎯 Overview

This project implements **Domain-Driven Design (DDD)** combined with **Hexagonal Architecture (Ports & Adapters)** in a NestJS application. The architecture ensures:

- **Separation of Concerns**: Clear boundaries between business logic and infrastructure
- **Testability**: Easy to test business logic in isolation
- **Flexibility**: Easy to swap implementations (databases, external services, etc.)
- **Maintainability**: Organized code structure that scales with complexity

## 🏗️ Architecture Principles

### Domain-Driven Design (DDD)
- **Entities**: Objects with identity that persist over time
- **Value Objects**: Immutable objects defined by their attributes
- **Aggregates**: Clusters of entities and value objects with defined boundaries
- **Domain Events**: Events that represent something that happened in the domain
- **Domain Services**: Business logic that doesn't naturally fit in entities

### Hexagonal Architecture
- **Ports**: Interfaces that define how the application communicates with the outside world
- **Adapters**: Implementations of ports (inbound: controllers, outbound: repositories)
- **Application Core**: Contains business logic, isolated from external concerns

## 📁 Folder Structure

```
src/
├── modules/                          # Business modules
│   ├── orders/                       # Orders bounded context
│   │   ├── application/              # Application layer
│   │   │   ├── dto/                  # Data Transfer Objects
│   │   │   │   ├── create-order.dto.ts
│   │   │   │   ├── update-order.dto.ts
│   │   │   │   ├── order-response.dto.ts
│   │   │   │   └── index.ts
│   │   │   ├── mappers/              # Domain ↔ DTO mappers
│   │   │   │   ├── order.mapper.ts
│   │   │   │   └── index.ts
│   │   │   ├── ports/                # Application interfaces
│   │   │   │   ├── inbound/          # Use case interfaces
│   │   │   │   │   ├── create-order.use-case.ts
│   │   │   │   │   ├── get-order.use-case.ts
│   │   │   │   │   └── index.ts
│   │   │   │   └── outbound/         # External service interfaces
│   │   │   │       ├── order-repository.port.ts
│   │   │   │       ├── notification.port.ts
│   │   │   │       └── index.ts
│   │   │   └── use-cases/            # Use case implementations
│   │   │       ├── create-order.use-case.impl.ts
│   │   │       ├── get-order.use-case.impl.ts
│   │   │       └── index.ts
│   │   ├── domain/                   # Domain layer (Pure business logic)
│   │   │   ├── entities/             # Domain entities
│   │   │   │   ├── order.entity.ts
│   │   │   │   └── index.ts
│   │   │   ├── events/               # Domain events
│   │   │   │   ├── order-created.event.ts
│   │   │   │   ├── order-status-changed.event.ts
│   │   │   │   └── index.ts
│   │   │   ├── repositories/         # Domain repository interfaces
│   │   │   │   ├── order.repository.interface.ts
│   │   │   │   └── index.ts
│   │   │   ├── services/             # Domain services
│   │   │   │   ├── order-validation.service.ts
│   │   │   │   └── index.ts
│   │   │   └── value-objects/        # Value objects
│   │   │       ├── order-item.vo.ts
│   │   │       └── index.ts
│   │   ├── infrastructure/           # Infrastructure layer
│   │   │   ├── adapters/             # Adapters implementation
│   │   │   │   ├── inbound/          # Inbound adapters (Controllers, GraphQL, etc.)
│   │   │   │   │   └── http/
│   │   │   │   │       ├── orders.controller.ts
│   │   │   │   │       └── index.ts
│   │   │   │   └── outbound/         # Outbound adapters (External services)
│   │   │   │       └── notification/
│   │   │   │           ├── email-notification.adapter.ts
│   │   │   │           └── index.ts
│   │   │   └── persistence/          # Persistence adapters
│   │   │       └── typeorm/
│   │   │           ├── entities/     # ORM entities
│   │   │           │   ├── order.typeorm-entity.ts
│   │   │           │   └── index.ts
│   │   │           ├── mappers/      # Domain ↔ ORM mappers
│   │   │           │   ├── order-typeorm.mapper.ts
│   │   │           │   └── index.ts
│   │   │           └── repositories/ # Repository implementations
│   │   │               ├── order-typeorm.repository.ts
│   │   │               └── index.ts
│   │   └── orders.module.ts          # Module configuration
│   │
│   └── users/                        # Users bounded context
│       ├── application/              # (Same structure as orders)
│       ├── domain/
│       ├── infrastructure/
│       └── users.module.ts
│
└── shared/                           # Shared kernel
    ├── application/                  # Shared application layer
    │   ├── exceptions/               # Custom exceptions
    │   │   ├── domain.exception.ts
    │   │   └── index.ts
    │   └── services/                 # Shared services
    │       ├── use-case.interface.ts
    │       └── index.ts
    ├── domain/                       # Shared domain layer
    │   ├── entities/                 # Base entities
    │   │   ├── base.entity.ts
    │   │   └── index.ts
    │   ├── events/                   # Base events
    │   │   ├── domain-event.ts
    │   │   └── index.ts
    │   └── value-objects/            # Base value objects
    │       ├── value-object.base.ts
    │       └── index.ts
    └── infrastructure/               # Shared infrastructure
        ├── config/                   # Configuration
        │   ├── configuration.ts
        │   └── index.ts
        ├── decorators/               # Custom decorators
        │   ├── roles.decorator.ts
        │   └── index.ts
        ├── guards/                   # Guards
        │   ├── roles.guard.ts
        │   └── index.ts
        ├── interceptors/             # Interceptors
        │   ├── logging.interceptor.ts
        │   └── index.ts
        ├── messaging/                # Event publishing
        │   ├── event-publisher.interface.ts
        │   └── index.ts
        ├── middleware/               # Middleware
        │   ├── request-logging.middleware.ts
        │   └── index.ts
        └── persistence/              # Persistence utilities
            ├── mapper.interface.ts
            └── index.ts
```

## 📚 Layer Descriptions

### 1. **Domain Layer** (Core Business Logic)
**Location**: `modules/{module}/domain/`

**Purpose**: Contains pure business logic with no external dependencies.

**Components**:
- **Entities**: Objects with unique identity (e.g., `Order`, `User`)
- **Value Objects**: Immutable objects defined by attributes (e.g., `Email`, `OrderItem`)
- **Domain Events**: Events that represent business occurrences
- **Domain Services**: Complex business logic involving multiple entities
- **Repository Interfaces**: Contracts for data persistence (defined in domain, implemented in infrastructure)

**Rules**:
- ❌ NO dependencies on other layers
- ❌ NO framework-specific code
- ✅ Pure TypeScript/JavaScript
- ✅ Business rules and validation
- ✅ Rich domain models

### 2. **Application Layer** (Use Cases)
**Location**: `modules/{module}/application/`

**Purpose**: Orchestrates domain objects to fulfill use cases.

**Components**:
- **Use Cases**: Application-specific business logic
- **DTOs**: Data contracts for API communication
- **Mappers**: Transform between DTOs and domain objects
- **Ports**: Interfaces for external dependencies
  - **Inbound Ports**: Define use case interfaces
  - **Outbound Ports**: Define interfaces for external services

**Rules**:
- ✅ Can depend on Domain layer
- ❌ NO dependencies on Infrastructure layer
- ✅ Orchestrates domain logic
- ✅ Handles transactions
- ✅ Publishes domain events

### 3. **Infrastructure Layer** (Technical Details)
**Location**: `modules/{module}/infrastructure/`

**Purpose**: Implements technical details and external integrations.

**Components**:
- **Inbound Adapters**: 
  - HTTP Controllers (REST API)
  - GraphQL Resolvers
  - CLI Commands
  - Message Consumers
  
- **Outbound Adapters**:
  - Repository Implementations
  - External Service Clients
  - Email Services
  - Payment Gateways
  
- **Persistence**:
  - ORM Entities (TypeORM, Prisma, etc.)
  - Database Mappers
  - Migration Scripts

**Rules**:
- ✅ Can depend on Application and Domain layers
- ✅ Framework-specific code (NestJS decorators, TypeORM, etc.)
- ✅ External service integrations
- ✅ Database configurations

### 4. **Shared Layer** (Shared Kernel)
**Location**: `shared/`

**Purpose**: Reusable components across all modules.

**Components**:
- Base classes and interfaces
- Common exceptions
- Shared value objects
- Cross-cutting concerns (logging, auth, etc.)
- Configuration management

## 💡 Implementation Examples

### Creating a New Entity

```typescript
// domain/entities/order.entity.ts
export class Order {
  private _id: string;
  private _status: OrderStatus;
  
  private constructor(id: string, status: OrderStatus) {
    this._id = id;
    this._status = status;
  }
  
  static create(customerId: string): Order {
    return new Order(uuidv4(), OrderStatus.PENDING);
  }
  
  confirm(): void {
    if (this._status !== OrderStatus.PENDING) {
      throw new Error('Only pending orders can be confirmed');
    }
    this._status = OrderStatus.CONFIRMED;
  }
}
```

### Creating a Use Case

```typescript
// application/use-cases/create-order.use-case.impl.ts
@Injectable()
export class CreateOrderUseCaseImpl implements ICreateOrderUseCase {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private repository: IOrderRepository,
  ) {}
  
  async execute(dto: CreateOrderDto): Promise<OrderResponseDto> {
    const order = Order.create(dto.customerId);
    const saved = await this.repository.save(order);
    return this.mapper.toDto(saved);
  }
}
```

### Implementing a Port (Repository)

```typescript
// infrastructure/persistence/typeorm/repositories/order.repository.ts
@Injectable()
export class OrderTypeormRepository implements IOrderRepository {
  constructor(
    @InjectRepository(OrderTypeormEntity)
    private repo: Repository<OrderTypeormEntity>,
    private mapper: OrderTypeormMapper,
  ) {}
  
  async save(order: Order): Promise<Order> {
    const entity = this.mapper.toPersistence(order);
    const saved = await this.repo.save(entity);
    return this.mapper.toDomain(saved);
  }
}
```

## ✨ Best Practices

### 1. Dependency Rule
- Dependencies point inward: Infrastructure → Application → Domain
- Domain layer has NO dependencies on outer layers

### 2. Use Interfaces (Ports)
- Application layer defines interfaces
- Infrastructure layer implements them
- Use dependency injection

### 3. Keep Domain Pure
- No framework dependencies in domain
- No database annotations on domain entities
- Business logic only

### 4. DTOs for API Communication
- Never expose domain entities directly
- Use DTOs for request/response
- Map between DTOs and domain objects

### 5. Value Objects for Validation
- Encapsulate validation logic
- Make value objects immutable
- Use for complex attributes (Email, Money, etc.)

### 6. Domain Events
- Publish events when important domain changes occur
- Use for inter-module communication
- Keep modules decoupled

### 7. Aggregates
- Group related entities together
- Ensure consistency boundaries
- Access child entities through aggregate root

## 📦 Dependencies

### Required Packages

```bash
# Core NestJS
npm install @nestjs/common @nestjs/core @nestjs/platform-express

# TypeORM (if using TypeORM)
npm install @nestjs/typeorm typeorm pg

# Validation
npm install class-validator class-transformer

# Configuration
npm install @nestjs/config

# UUID Generation
npm install uuid
npm install -D @types/uuid

# Password Hashing
npm install bcrypt
npm install -D @types/bcrypt

# Testing
npm install -D @nestjs/testing jest @types/jest

# Mapped Types (for DTOs)
npm install @nestjs/mapped-types
```

### Environment Variables

Create a `.env` file:

```env
# Application
PORT=3000
NODE_ENV=development
API_PREFIX=api

# Database
DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=nest_ddd
DB_SYNCHRONIZE=false
```

## 🚀 Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Set Up Database**
   - Create a PostgreSQL database
   - Update `.env` with your credentials

3. **Run Migrations** (if using TypeORM migrations)
   ```bash
   npm run migration:run
   ```

4. **Start the Application**
   ```bash
   npm run start:dev
   ```

## 🧪 Testing

### Unit Tests (Domain Logic)
```typescript
describe('Order Entity', () => {
  it('should create a new order', () => {
    const order = Order.create('customer-123');
    expect(order.status).toBe(OrderStatus.PENDING);
  });
});
```

### Integration Tests (Use Cases)
```typescript
describe('CreateOrderUseCase', () => {
  it('should create an order', async () => {
    const dto = { customerId: '123', items: [...] };
    const result = await useCase.execute(dto);
    expect(result.id).toBeDefined();
  });
});
```

## 📖 Additional Resources

- [Domain-Driven Design by Eric Evans](https://www.domainlanguage.com/ddd/)
- [Hexagonal Architecture by Alistair Cockburn](https://alistair.cockburn.us/hexagonal-architecture/)
- [NestJS Documentation](https://docs.nestjs.com/)
- [Clean Architecture by Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

---

## 📝 Notes

- **Bounded Contexts**: Each module represents a bounded context in DDD
- **Anti-Corruption Layer**: Use adapters to prevent external changes from affecting your domain
- **CQRS**: This structure can be extended to support CQRS (Command Query Responsibility Segregation)
- **Event Sourcing**: Can be implemented by storing domain events

## 🤝 Contributing

When adding new features:
1. Start with the domain model
2. Define use cases in the application layer
3. Implement infrastructure adapters
4. Write tests for each layer
5. Update this documentation

---

**Remember**: The goal is to keep business logic isolated, testable, and independent of technical details!
