# DDD + Hexagonal Architecture - NestJS

This project follows **Domain-Driven Design (DDD)** principles combined with **Hexagonal Architecture** (Ports and Adapters) to create a maintainable, testable, and scalable application.

## 📁 Folder Structure

```
src/
├── main.ts                          # Application entry point
├── app.module.ts                    # Root module
├── app.controller.ts                # Root controller
├── app.service.ts                   # Root service
│
├── modules/                         # Bounded Contexts (DDD)
│   ├── orders/                      # Order Bounded Context
│   │   ├── domain/                  # Domain Layer (Business Logic)
│   │   │   ├── entities/            # Domain entities (aggregates, entities)
│   │   │   ├── value-objects/       # Value objects (immutable objects)
│   │   │   ├── repositories/        # Repository interfaces (ports)
│   │   │   ├── events/              # Domain events
│   │   │   └── services/            # Domain services (business logic)
│   │   │
│   │   ├── application/             # Application Layer (Use Cases)
│   │   │   ├── use-cases/           # Use case implementations
│   │   │   ├── dto/                 # Data Transfer Objects
│   │   │   ├── mappers/             # DTO ↔ Domain mappers
│   │   │   └── ports/               # Application ports (interfaces)
│   │   │
│   │   ├── infrastructure/          # Infrastructure Layer (Adapters)
│   │   │   ├── adapters/
│   │   │   │   ├── inbound/         # Input adapters (REST, GraphQL, etc.)
│   │   │   │   │   └── http/        # HTTP controllers
│   │   │   │   └── outbound/        # Output adapters (DB, APIs, etc.)
│   │   │   │       └── persistence/ # Repository implementations
│   │   │   └── persistence/
│   │   │       └── typeorm/         # TypeORM entities, migrations
│   │   │
│   │   └── orders.module.ts         # Module configuration
│   │
│   └── users/                       # User Bounded Context
│       ├── domain/
│       │   ├── entities/
│       │   ├── value-objects/
│       │   ├── repositories/
│       │   ├── events/
│       │   └── services/
│       ├── application/
│       │   ├── use-cases/
│       │   ├── dto/
│       │   ├── mappers/
│       │   └── ports/
│       ├── infrastructure/
│       │   ├── adapters/
│       │   │   ├── inbound/
│       │   │   └── outbound/
│       │   └── persistence/
│       │       └── typeorm/
│       └── users.module.ts
│
└── shared/                          # Shared Kernel (DDD)
    ├── domain/                      # Shared domain concepts
    │   ├── entities/                # Base entity classes
    │   ├── value-objects/           # Shared value objects
    │   └── events/                  # Shared domain events
    │
    ├── application/                 # Shared application layer
    │   ├── services/                # Shared application services
    │   └── exceptions/              # Custom exceptions
    │
    └── infrastructure/              # Shared infrastructure
        ├── persistence/             # Database configuration
        ├── messaging/               # Message broker setup
        ├── config/                  # Configuration files
        ├── guards/                  # NestJS guards
        ├── interceptors/            # NestJS interceptors
        ├── middleware/              # NestJS middleware
        └── decorators/              # Custom decorators
```

## 🏗️ Architecture Layers

### 1. **Domain Layer** (Core Business Logic)
- **Purpose**: Contains the business logic and rules
- **Components**:
  - **Entities**: Objects with identity and lifecycle (e.g., Order, User)
  - **Value Objects**: Immutable objects without identity (e.g., Money, Email)
  - **Aggregates**: Cluster of entities and value objects
  - **Domain Events**: Events that occur in the domain
  - **Domain Services**: Business logic that doesn't fit in entities
  - **Repository Interfaces**: Contracts for data persistence (ports)

**Rules**:
- ✅ Can depend on: Nothing (pure business logic)
- ❌ Cannot depend on: Application, Infrastructure layers
- 🎯 Goal: Framework-agnostic, testable business logic

### 2. **Application Layer** (Use Cases/Orchestration)
- **Purpose**: Orchestrates the flow of data and coordinates domain objects
- **Components**:
  - **Use Cases**: Application-specific business rules (e.g., CreateOrder, UpdateUser)
  - **DTOs**: Data Transfer Objects for input/output
  - **Mappers**: Convert between DTOs and Domain objects
  - **Ports**: Interfaces for external systems

**Rules**:
- ✅ Can depend on: Domain layer
- ❌ Cannot depend on: Infrastructure layer (only through ports)
- 🎯 Goal: Define what the system does, not how

### 3. **Infrastructure Layer** (Technical Details)
- **Purpose**: Implements technical concerns and external integrations
- **Components**:
  - **Inbound Adapters**: Entry points (REST controllers, GraphQL resolvers, CLI)
  - **Outbound Adapters**: External integrations (Repository implementations, APIs)
  - **Persistence**: Database schemas, migrations, ORM entities
  - **Configuration**: Framework-specific configuration

**Rules**:
- ✅ Can depend on: Domain, Application layers
- 🎯 Goal: Implement the technical details

## 🔌 Hexagonal Architecture (Ports & Adapters)

### Ports
- **Inbound Ports**: Interfaces exposed by application (use cases)
- **Outbound Ports**: Interfaces required by application (repositories, external services)

### Adapters
- **Inbound Adapters**: Implement entry points (REST, GraphQL, CLI)
- **Outbound Adapters**: Implement external integrations (DB, APIs, Message queues)

```
                    ┌─────────────────────────────────┐
                    │   Inbound Adapters (Driving)    │
                    │  REST │ GraphQL │ CLI │ gRPC    │
                    └────────────────┬────────────────┘
                                     │
                    ┌────────────────▼────────────────┐
                    │     Application Layer (Core)     │
                    │         Use Cases + Ports         │
                    └────────────────┬────────────────┘
                                     │
                    ┌────────────────▼────────────────┐
                    │       Domain Layer (Core)        │
                    │    Entities + Value Objects      │
                    └────────────────┬────────────────┘
                                     │
                    ┌────────────────▼────────────────┐
                    │  Outbound Adapters (Driven)     │
                    │  Database │ APIs │ Message Q    │
                    └─────────────────────────────────┘
```

## 📝 Example: Order Module Flow

### 1. **HTTP Request** (Inbound Adapter)
```typescript
// infrastructure/adapters/inbound/http/orders.controller.ts
@Controller('orders')
export class OrdersController {
  constructor(private createOrderUseCase: CreateOrderUseCase) {}

  @Post()
  async create(@Body() dto: CreateOrderDto) {
    return await this.createOrderUseCase.execute(dto);
  }
}
```

### 2. **Use Case** (Application Layer)
```typescript
// application/use-cases/create-order.use-case.ts
export class CreateOrderUseCase {
  constructor(
    private orderRepository: IOrderRepository,
    private eventBus: IEventBus
  ) {}

  async execute(dto: CreateOrderDto): Promise<OrderDto> {
    // Map DTO to Domain Entity
    const order = Order.create(dto);
    
    // Use Domain logic
    order.validate();
    
    // Persist via Repository Port
    await this.orderRepository.save(order);
    
    // Publish Domain Event
    await this.eventBus.publish(new OrderCreatedEvent(order));
    
    // Map Domain Entity to DTO
    return OrderMapper.toDto(order);
  }
}
```

### 3. **Domain Entity** (Domain Layer)
```typescript
// domain/entities/order.entity.ts
export class Order extends AggregateRoot {
  private constructor(
    private id: OrderId,
    private customerId: CustomerId,
    private items: OrderItem[],
    private status: OrderStatus
  ) {}

  static create(data: any): Order {
    // Domain validation and business rules
    const order = new Order(
      OrderId.generate(),
      new CustomerId(data.customerId),
      data.items.map(item => OrderItem.create(item)),
      OrderStatus.Pending
    );
    return order;
  }

  validate(): void {
    if (this.items.length === 0) {
      throw new DomainException('Order must have at least one item');
    }
  }
}
```

### 4. **Repository Implementation** (Outbound Adapter)
```typescript
// infrastructure/adapters/outbound/persistence/typeorm-order.repository.ts
@Injectable()
export class TypeOrmOrderRepository implements IOrderRepository {
  constructor(
    @InjectRepository(OrderEntity)
    private orderRepository: Repository<OrderEntity>
  ) {}

  async save(order: Order): Promise<void> {
    const entity = OrderMapper.toPersistence(order);
    await this.orderRepository.save(entity);
  }

  async findById(id: OrderId): Promise<Order | null> {
    const entity = await this.orderRepository.findOne({ where: { id: id.value } });
    return entity ? OrderMapper.toDomain(entity) : null;
  }
}
```

## 🎯 Key Principles

### DDD Principles
1. **Ubiquitous Language**: Use the same terms in code as in business
2. **Bounded Contexts**: Clear boundaries between different domains
3. **Aggregates**: Consistency boundaries for entities
4. **Domain Events**: Communicate changes across bounded contexts
5. **Anti-Corruption Layer**: Protect your domain from external systems

### Hexagonal Architecture Principles
1. **Dependency Inversion**: Depend on abstractions (ports), not implementations
2. **Technology Agnostic Core**: Business logic independent of frameworks
3. **Testability**: Easy to test core logic without infrastructure
4. **Flexibility**: Easy to swap adapters (change DB, API, framework)

## 🧪 Testing Strategy

```
Domain Layer        → Unit Tests (Pure logic, no dependencies)
Application Layer   → Integration Tests (Use mocked ports)
Infrastructure      → E2E Tests (Test real adapters)
```

## 📦 Module Structure

Each bounded context (module) should:
1. Have its own module file (`*.module.ts`)
2. Export only necessary interfaces/DTOs
3. Keep domain logic private
4. Communicate via domain events or APIs

## 🔄 Data Flow

```
Request → Controller (Adapter) 
        → Use Case (Application) 
        → Domain Entity (Business Logic) 
        → Repository (Port) 
        → Repository Implementation (Adapter) 
        → Database
```

## 🚀 Benefits

1. **Maintainability**: Clear separation of concerns
2. **Testability**: Easy to test each layer independently
3. **Flexibility**: Easy to change infrastructure without affecting business logic
4. **Scalability**: Bounded contexts can be scaled independently
5. **Team Collaboration**: Clear boundaries for parallel development

## 📚 Additional Resources

- [Domain-Driven Design by Eric Evans](https://www.domainlanguage.com/ddd/)
- [Hexagonal Architecture by Alistair Cockburn](https://alistair.cockburn.us/hexagonal-architecture/)
- [NestJS Documentation](https://docs.nestjs.com/)

## 🗺️ Migration Guide

To migrate existing code to this architecture:

1. **Move existing entities** to appropriate `domain/entities/` folders
2. **Move existing guards** to `shared/infrastructure/guards/`
3. **Move existing interceptors** to `shared/infrastructure/interceptors/`
4. **Move existing middleware** to `shared/infrastructure/middleware/`
5. **Move existing decorators** to `shared/infrastructure/decorators/`
6. **Create use cases** in `application/use-cases/` for each business operation
7. **Define repository ports** in `domain/repositories/`
8. **Implement repositories** in `infrastructure/adapters/outbound/persistence/`
9. **Create controllers** in `infrastructure/adapters/inbound/http/`
10. **Update module imports** to follow the new structure

---

**Note**: This architecture is a guideline. Adapt it to your project's needs. Start simple and evolve as the project grows.
