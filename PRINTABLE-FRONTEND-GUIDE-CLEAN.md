# Complete Frontend Architecture Guide
## DDD + Hexagonal Architecture in Angular

## TABLE OF CONTENTS

### PART 1: Architecture Overview (from FE-DOC-2.md)
- DDD Concepts
- Hexagonal Architecture
- Core Principles
- Benefits and Use Cases

### PART 2: Complete Folder Structure (from FE_ARCH_FOLDER_STRUCT_DOC-2.md)
- Full Project Structure
- Layer Breakdown
- Naming Conventions
- Examples

### PART 3: Real-World Examples (from FRONT_END_ARCH_REPO_DOC.md)
- GitHub Repositories
- Learning Resources
- Best Practices

### PART 4: Implementation Guide (from FRONT-END-ARCHITECTURE.md)
- Code Examples
- Complete Implementation
- Patterns and Practices

---
---

# PART 1: ARCHITECTURE OVERVIEW

Perfect! Let's continue with the next file.

---

## **File 2: docs/architecture/01-overview.md**

```markdown
# 01 - Overview: DDD + Hexagonal Architecture in Angular

## 📖 Table of Contents

- [What is Domain-Driven Design (DDD)?](#what-is-domain-driven-design-ddd)
- [What is Hexagonal Architecture?](#what-is-hexagonal-architecture)
- [Why Use This Architecture in Angular?](#why-use-this-architecture-in-angular)
- [Core Concepts](#core-concepts)
- [Architecture Layers](#architecture-layers)
- [Dependency Rules](#dependency-rules)
- [Benefits](#benefits)
- [When to Use This Architecture](#when-to-use-this-architecture)

---

## What is Domain-Driven Design (DDD)?

**Domain-Driven Design** is an approach to software development that focuses on:

1. **Understanding the business domain** - The problem space you're solving
2. **Creating a rich domain model** - Entities, Value Objects, Aggregates
3. **Using ubiquitous language** - Same terminology between developers and domain experts
4. **Defining bounded contexts** - Clear boundaries between different parts of the system

### Key DDD Concepts

```typescript
// Entity - Has identity and lifecycle
class Order {
  constructor(
    public readonly id: string,
    private items: OrderItem[],
    private status: OrderStatus
  ) {}

  // Business logic in the entity
  addItem(item: OrderItem): void {
    if (this.status !== OrderStatus.DRAFT) {
      throw new Error('Cannot add items to non-draft orders');
    }
    this.items.push(item);
  }
}

// Value Object - Immutable, no identity
class Money {
  constructor(
    public readonly amount: number,
    public readonly currency: string
  ) {
    if (amount < 0) throw new Error('Amount cannot be negative');
  }

  add(other: Money): Money {
    if (this.currency !== other.currency) {
      throw new Error('Cannot add different currencies');
    }
    return new Money(this.amount + other.amount, this.currency);
  }
}

// Use Case - Business operation
class CreateOrderUseCase {
  execute(customerId: string, items: OrderItem[]): Observable<Order> {
    // Validate business rules
    if (items.length === 0) {
      throw new Error('Order must have at least one item');
    }

    const order = Order.create(customerId, items);
    return this.repository.save(order);
  }
}
```

---

## What is Hexagonal Architecture?

**Hexagonal Architecture** (also known as Ports and Adapters) is an architectural pattern that:

1. **Isolates business logic** - Domain is independent of frameworks
2. **Uses ports (interfaces)** - Define contracts for external dependencies
3. **Uses adapters** - Implementations of ports (HTTP, Database, etc.)
4. **Enables testability** - Easy to mock and test

### The Hexagon Diagram

```
                    ┌─────────────────────────┐
                    │   Presentation Layer    │
                    │   (Angular Components)  │
                    └───────────┬─────────────┘
                                │
                    ┌───────────▼─────────────┐
                    │   Application Layer     │
                    │   (Facades, State)      │
                    └───────────┬─────────────┘
                                │
        ┌───────────────────────▼───────────────────────┐
        │                                                │
        │              DOMAIN (Core)                     │
        │        - Entities                              │
        │        - Value Objects                         │
        │        - Use Cases                             │
        │        - Ports (Interfaces)                    │
        │                                                │
        └───────────────────────┬───────────────────────┘
                                │
                    ┌───────────▼─────────────┐
                    │  Infrastructure Layer   │
                    │  (Adapters)             │
                    │  - HTTP Repository      │
                    │  - LocalStorage         │
                    │  - External APIs        │
                    └─────────────────────────┘
```

### Ports and Adapters Example

```typescript
// PORT (Interface in Domain)
export interface IOrderRepository {
  findById(id: string): Observable<Order>;
  save(order: Order): Observable<Order>;
}

// ADAPTER (Implementation in Infrastructure)
@Injectable()
export class OrderHttpRepository implements IOrderRepository {
  constructor(private http: HttpClient) {}

  findById(id: string): Observable<Order> {
    return this.http.get<OrderDTO>(`/api/orders/${id}`).pipe(
      map(dto => this.toDomain(dto))
    );
  }

  save(order: Order): Observable<Order> {
    const dto = this.toDTO(order);
    return this.http.post<OrderDTO>('/api/orders', dto).pipe(
      map(dto => this.toDomain(dto))
    );
  }
}
```

---

## Why Use This Architecture in Angular?

### ❌ Problems with Traditional Angular Architecture

```typescript
// ❌ Component knows about HTTP, business logic mixed with UI
@Component({
  selector: 'app-order-list'
})
export class OrderListComponent {
  orders: Order[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    // Business logic in component
    this.http.get<any[]>('/api/orders').subscribe(data => {
      this.orders = data.filter(o => o.status !== 'CANCELLED');
      // More business logic...
    });
  }

  createOrder(items: any[]) {
    // Validation in component
    if (items.length === 0) {
      alert('Must have items');
      return;
    }
    // HTTP call in component
    this.http.post('/api/orders', { items }).subscribe();
  }
}
```

**Problems:**
- Business logic scattered across components
- Hard to test (need to mock HTTP)
- Difficult to reuse logic
- Tight coupling to Angular and HTTP

### ✅ With DDD + Hexagonal Architecture

```typescript
// ✅ Component only knows about Facade
@Component({
  selector: 'app-order-list'
})
export class OrderListComponent {
  orders$ = this.facade.orders$;

  constructor(private facade: OrderFacade) {}

  ngOnInit() {
    this.facade.loadOrders();
  }

  createOrder(items: any[]) {
    this.facade.createOrder(items).subscribe();
  }
}

// Business logic in Use Case (testable)
export class CreateOrderUseCase {
  execute(items: OrderItem[]): Observable<Order> {
    if (items.length === 0) {
      throw new Error('Order must have at least one item');
    }
    const order = Order.create(items);
    return this.repository.save(order);
  }
}

// Infrastructure handles HTTP
export class OrderHttpRepository implements IOrderRepository {
  save(order: Order): Observable<Order> {
    return this.http.post<OrderDTO>('/api/orders', this.toDTO(order));
  }
}
```

**Benefits:**
- Business logic in domain (reusable, testable)
- Component focuses on UI
- Easy to test (mock facade)
- Can swap HTTP for anything (LocalStorage, GraphQL)

---

## Core Concepts

### 1. Entities

Objects with **identity** that persist over time.

```typescript
export class Order {
  constructor(
    public readonly id: string, // Identity
    public customerId: string,
    private items: OrderItem[],
    private status: OrderStatus
  ) {}

  // Business methods
  confirm(): void {
    if (this.status !== OrderStatus.DRAFT) {
      throw new Error('Only draft orders can be confirmed');
    }
    this.status = OrderStatus.CONFIRMED;
  }
}
```

### 2. Value Objects

Objects without identity, defined by their **values**.

```typescript
export class Money {
  constructor(
    public readonly amount: number,
    public readonly currency: string
  ) {
    if (amount < 0) throw new Error('Amount cannot be negative');
  }

  equals(other: Money): boolean {
    return this.amount === other.amount && 
           this.currency === other.currency;
  }

  add(other: Money): Money {
    return new Money(this.amount + other.amount, this.currency);
  }
}
```

### 3. Aggregates

Cluster of entities and value objects with a **root entity**.

```typescript
export class Order { // Aggregate Root
  constructor(
    public readonly id: string,
    private items: OrderItem[], // Child entities
    private total: Money // Value object
  ) {}

  // Only root can modify children
  addItem(item: OrderItem): void {
    this.items.push(item);
    this.recalculateTotal();
  }

  // Aggregate boundary
  getItems(): OrderItem[] {
    return [...this.items]; // Return copy
  }
}
```

### 4. Use Cases

Single business operations.

```typescript
export class CreateOrderUseCase {
  constructor(
    @Inject(ORDER_REPOSITORY_TOKEN) 
    private repository: IOrderRepository
  ) {}

  execute(command: CreateOrderCommand): Observable<Order> {
    // 1. Validate
    this.validate(command);

    // 2. Create domain object
    const order = Order.create(command.customerId, command.items);

    // 3. Persist
    return this.repository.save(order);
  }
}
```

### 5. Repositories (Ports)

Interfaces for data access.

```typescript
export interface IOrderRepository {
  findById(id: string): Observable<Order>;
  findAll(): Observable<Order[]>;
  save(order: Order): Observable<Order>;
  delete(id: string): Observable<void>;
}
```

### 6. Facades

Orchestrate use cases and state for UI.

```typescript
@Injectable()
export class OrderFacade {
  orders$ = this.store.orders$;

  constructor(
    private store: OrderStore,
    private createUseCase: CreateOrderUseCase,
    private getAllUseCase: GetAllOrdersUseCase
  ) {}

  loadOrders(): void {
    this.getAllUseCase.execute().pipe(
      tap(orders => this.store.setOrders(orders))
    ).subscribe();
  }

  createOrder(data: any): Observable<Order> {
    return this.createUseCase.execute(data).pipe(
      tap(order => this.store.addOrder(order))
    );
  }
}
```

---

## Architecture Layers

### Layer Overview

```
┌─────────────────────────────────────────┐
│        PRESENTATION LAYER               │  ← Angular Components
│  - Pages (Smart Components)             │  ← Know about Facade
│  - Components (Dumb Components)         │  ← Only @Input/@Output
│  - View Models                          │
└──────────────┬──────────────────────────┘
               │ uses
┌──────────────▼──────────────────────────┐
│        APPLICATION LAYER                │  ← Orchestration
│  - Facades                              │  ← Coordinate use cases
│  - State/Store                          │  ← Manage state
│  - DTOs                                 │
└──────────────┬──────────────────────────┘
               │ uses
┌──────────────▼──────────────────────────┐
│          DOMAIN LAYER                   │  ← Pure Business Logic
│  - Entities                             │  ← Core objects
│  - Value Objects                        │  ← Immutable values
│  - Use Cases                            │  ← Business operations
│  - Ports (Interfaces)                   │  ← Contracts
│  - Domain Services                      │  ← Cross-entity logic
└──────────────┬──────────────────────────┘
               │ implemented by
┌──────────────▼──────────────────────────┐
│      INFRASTRUCTURE LAYER               │  ← External World
│  - Repositories (HTTP)                  │  ← Data access
│  - Adapters (APIs, Storage)            │  ← External services
│  - Mappers (DTO ↔ Domain)              │  ← Transformations
└─────────────────────────────────────────┘
```

---

## Dependency Rules

### The Dependency Rule

> **Dependencies point inward. Inner layers know nothing about outer layers.**

```typescript
// ✅ GOOD: Application depends on Domain
import { CreateOrderUseCase } from '../../domain/use-cases/create-order.use-case';

// ✅ GOOD: Infrastructure implements Domain interface
export class OrderHttpRepository implements IOrderRepository {
  // ...
}

// ❌ BAD: Domain depends on Infrastructure
import { OrderHttpRepository } from '../../infrastructure/repositories/order-http.repository';

// ❌ BAD: Domain depends on Angular
import { Injectable } from '@angular/core';
export class Order { } // Domain entities should be pure TypeScript
```

### Allowed Dependencies

```
Presentation → Application → Domain ← Infrastructure
     ✅            ✅           ✅

Domain → Application    ❌
Domain → Infrastructure ❌
Domain → Presentation   ❌
```

---

## Benefits

### 1. **Testability**

```typescript
// Easy to test - no Angular, no HTTP
describe('CreateOrderUseCase', () => {
  it('should create order with valid items', () => {
    const mockRepo = { save: jest.fn() };
    const useCase = new CreateOrderUseCase(mockRepo);
    
    const result = useCase.execute({ items: [item1] });
    
    expect(result).toBeDefined();
  });
});
```

### 2. **Maintainability**

- Clear separation of concerns
- Easy to find code
- Changes isolated to specific layers

### 3. **Scalability**

- Add new features without affecting existing
- Team can work in parallel
- Easy to split into micro-frontends

### 4. **Technology Independence**

```typescript
// Easy to swap implementations
providers: [
  { 
    provide: ORDER_REPOSITORY_TOKEN, 
    useClass: OrderHttpRepository // Can swap with OrderGraphQLRepository
  }
]
```

### 5. **Reusability**

- Use cases can be called from anywhere
- Domain logic reusable across features
- Components highly reusable

---

## When to Use This Architecture

### ✅ Use When:

- Building **enterprise applications**
- **Complex business logic** (not just CRUD)
- **Multiple developers** on the team
- **Long-term maintenance** expected
- Need **high testability**
- Working with **evolving requirements**
- Building **scalable applications**

### ❌ Don't Use When:

- Simple CRUD app
- Prototype or POC
- Very small team (1-2 developers)
- Tight deadline with no future maintenance
- Simple forms with basic validation

---

## Comparison with Other Architectures

| Architecture | Layers | Complexity | Use Case |
|--------------|--------|------------|----------|
| **MVC/MVVM** | 3 layers | Low | Small apps |
| **Clean Architecture** | 4 layers | Medium-High | Large apps |
| **Hexagonal (this)** | 4 layers | Medium-High | Enterprise apps |
| **Micro-frontends** | Distributed | Very High | Huge apps |

---

## Next Steps

Now that you understand the overview, dive into:

1. [**Complete Folder Structure**](02-complete-folder-structure.md) - See how to organize files
2. [**Domain Layer**](03-domain-layer.md) - Build your business logic
3. [**Order System Example**](../../examples/order-system/01-domain-models.md) - See a real implementation

---

## Summary

**DDD + Hexagonal Architecture in Angular provides:**

```
✅ Clear separation of business logic and UI
✅ Highly testable code
✅ Technology independence
✅ Scalability for enterprise apps
✅ Better team collaboration
✅ Maintainable codebase
```

**Key Principles:**
1. Domain is pure TypeScript (no frameworks)
2. Use ports (interfaces) and adapters (implementations)
3. Dependencies point inward
4. Business logic in use cases
5. Components are thin and focused on UI

---

**Next:** [Complete Folder Structure →](02-complete-folder-structure.md)
```

---

Save this as `docs/architecture/01-overview.md`.

**Ready for the next file?** Let me know! 🚀

---
---

# PART 2: COMPLETE FOLDER STRUCTURE

Perfect! Let's continue with the next file.

---

## **File 3: docs/architecture/02-complete-folder-structure.md**

```markdown
# 02 - Complete Folder Structure

## 📖 Table of Contents

- [Overview](#overview)
- [Complete Structure](#complete-structure)
- [Layer Breakdown](#layer-breakdown)
- [Naming Conventions](#naming-conventions)
- [File Suffixes](#file-suffixes)
- [Import Rules](#import-rules)
- [Path Aliases](#path-aliases)
- [Real Example: Order Feature](#real-example-order-feature)

---

## Overview

This folder structure follows **DDD + Hexagonal Architecture** principles with clear separation between:

- **Core** - App-wide singletons
- **Shared** - Generic reusable components
- **Domain-Shared** - Domain-specific shared components
- **Features** - Business features with 4 layers each

---

## Complete Structure

```
src/
├── app/
│   │
│   ├── core/                                    # 🌐 CORE MODULE
│   │   │                                        # App-wide singletons (imported once)
│   │   │
│   │   ├── auth/
│   │   │   ├── guards/
│   │   │   │   ├── auth.guard.ts
│   │   │   │   └── role.guard.ts
│   │   │   │
│   │   │   ├── interceptors/
│   │   │   │   ├── auth.interceptor.ts
│   │   │   │   ├── error.interceptor.ts
│   │   │   │   └── logging.interceptor.ts
│   │   │   │
│   │   │   └── services/
│   │   │       ├── auth.service.ts
│   │   │       └── token.service.ts
│   │   │
│   │   ├── error-handling/
│   │   │   ├── global-error-handler.ts
│   │   │   └── error-logger.service.ts
│   │   │
│   │   ├── services/
│   │   │   ├── event-bus.service.ts
│   │   │   └── notification.service.ts
│   │   │
│   │   └── core.module.ts
│   │
│   │
│   ├── shared/                                  # 🔧 SHARED MODULE
│   │   │                                        # Generic components (no domain knowledge)
│   │   │
│   │   ├── components/
│   │   │   ├── loading-spinner/
│   │   │   │   ├── loading-spinner.component.ts
│   │   │   │   ├── loading-spinner.component.html
│   │   │   │   └── loading-spinner.component.scss
│   │   │   │
│   │   │   ├── error-message/
│   │   │   │   ├── error-message.component.ts
│   │   │   │   ├── error-message.component.html
│   │   │   │   └── error-message.component.scss
│   │   │   │
│   │   │   ├── confirmation-dialog/
│   │   │   │   ├── confirmation-dialog.component.ts
│   │   │   │   ├── confirmation-dialog.component.html
│   │   │   │   └── confirmation-dialog.component.scss
│   │   │   │
│   │   │   ├── data-table/
│   │   │   │   ├── data-table.component.ts
│   │   │   │   ├── data-table.component.html
│   │   │   │   └── data-table.component.scss
│   │   │   │
│   │   │   ├── button/
│   │   │   │   ├── button.component.ts
│   │   │   │   ├── button.component.html
│   │   │   │   └── button.component.scss
│   │   │   │
│   │   │   ├── modal/
│   │   │   │   ├── modal.component.ts
│   │   │   │   ├── modal.component.html
│   │   │   │   └── modal.component.scss
│   │   │   │
│   │   │   └── card/
│   │   │       ├── card.component.ts
│   │   │       ├── card.component.html
│   │   │       └── card.component.scss
│   │   │
│   │   ├── pipes/
│   │   │   ├── currency-format.pipe.ts
│   │   │   ├── date-format.pipe.ts
│   │   │   ├── truncate.pipe.ts
│   │   │   └── safe-html.pipe.ts
│   │   │
│   │   ├── directives/
│   │   │   ├── auto-focus.directive.ts
│   │   │   ├── click-outside.directive.ts
│   │   │   ├── debounce-click.directive.ts
│   │   │   └── tooltip.directive.ts
│   │   │
│   │   ├── validators/
│   │   │   ├── email-validator.ts
│   │   │   ├── phone-validator.ts
│   │   │   └── custom-validators.ts
│   │   │
│   │   ├── utils/
│   │   │   ├── date.utils.ts
│   │   │   ├── string.utils.ts
│   │   │   ├── array.utils.ts
│   │   │   └── object.utils.ts
│   │   │
│   │   ├── models/
│   │   │   ├── pagination.model.ts
│   │   │   ├── api-response.model.ts
│   │   │   └── filter.model.ts
│   │   │
│   │   ├── index.ts                             # Barrel export
│   │   └── shared.module.ts
│   │
│   │
│   ├── domain-shared/                           # 🎯 DOMAIN-SHARED
│   │   │                                        # Domain-specific components used across features
│   │   │
│   │   ├── order-shared/
│   │   │   ├── components/
│   │   │   │   ├── order-card/
│   │   │   │   │   ├── order-card.component.ts
│   │   │   │   │   ├── order-card.component.html
│   │   │   │   │   └── order-card.component.scss
│   │   │   │   │
│   │   │   │   └── order-status-badge/
│   │   │   │       ├── order-status-badge.component.ts
│   │   │   │       ├── order-status-badge.component.html
│   │   │   │       └── order-status-badge.component.scss
│   │   │   │
│   │   │   ├── view-models/
│   │   │   │   └── order-shared.view-model.ts
│   │   │   │
│   │   │   ├── index.ts
│   │   │   └── order-shared.module.ts
│   │   │
│   │   └── customer-shared/
│   │       ├── components/
│   │       │   └── customer-card/
│   │       │       ├── customer-card.component.ts
│   │       │       ├── customer-card.component.html
│   │       │       └── customer-card.component.scss
│   │       │
│   │       ├── index.ts
│   │       └── customer-shared.module.ts
│   │
│   │
│   └── features/                                # 🎨 FEATURES
│       │                                        # Business features (lazy-loaded)
│       │
│       │
│       ├── order/                               # ═══════════════════════════════
│       │   │                                    # ORDER FEATURE
│       │   │                                    # ═══════════════════════════════
│       │   │
│       │   ├── domain/                          # 💎 DOMAIN LAYER
│       │   │   │                                # Pure business logic (NO Angular)
│       │   │   │
│       │   │   ├── models/
│       │   │   │   ├── order.model.ts           # Order aggregate root
│       │   │   │   ├── order-item.model.ts      # Order item entity
│       │   │   │   │
│       │   │   │   └── value-objects/
│       │   │   │       ├── money.vo.ts          # Money value object
│       │   │   │       ├── order-status.vo.ts   # Order status enum
│       │   │   │       ├── address.vo.ts        # Address value object
│       │   │   │       └── quantity.vo.ts       # Quantity value object
│       │   │   │
│       │   │   ├── ports/                       # Interfaces (Hexagonal ports)
│       │   │   │   ├── order.repository.interface.ts
│       │   │   │   ├── payment.service.interface.ts
│       │   │   │   ├── notification.service.interface.ts
│       │   │   │   └── inventory.service.interface.ts
│       │   │   │
│       │   │   ├── services/                    # Domain services
│       │   │   │   ├── order-validation.service.ts
│       │   │   │   ├── order-pricing.service.ts
│       │   │   │   └── order-policy.service.ts
│       │   │   │
│       │   │   ├── events/                      # Domain events
│       │   │   │   ├── order-created.event.ts
│       │   │   │   ├── order-confirmed.event.ts
│       │   │   │   ├── order-cancelled.event.ts
│       │   │   │   └── order-shipped.event.ts
│       │   │   │
│       │   │   ├── exceptions/                  # Domain exceptions
│       │   │   │   ├── domain.exception.ts
│       │   │   │   ├── invalid-order-state.exception.ts
│       │   │   │   ├── insufficient-inventory.exception.ts
│       │   │   │   └── payment-failed.exception.ts
│       │   │   │
│       │   │   └── use-cases/                   # Business operations
│       │   │       ├── get-order-by-id.use-case.ts
│       │   │       ├── get-all-orders.use-case.ts
│       │   │       ├── create-order.use-case.ts
│       │   │       ├── update-order.use-case.ts
│       │   │       ├── cancel-order.use-case.ts
│       │   │       ├── confirm-order.use-case.ts
│       │   │       ├── ship-order.use-case.ts
│       │   │       └── calculate-order-total.use-case.ts
│       │   │
│       │   │
│       │   ├── infrastructure/                  # 🔌 INFRASTRUCTURE LAYER
│       │   │   │                                # External dependencies
│       │   │   │
│       │   │   ├── repositories/
│       │   │   │   ├── order-http.repository.ts # HTTP implementation
│       │   │   │   ├── order-local-storage.repository.ts
│       │   │   │   └── order-mock.repository.ts # For testing
│       │   │   │
│       │   │   ├── adapters/                    # External service adapters
│       │   │   │   ├── payment-stripe.adapter.ts
│       │   │   │   ├── payment-paypal.adapter.ts
│       │   │   │   ├── notification-email.adapter.ts
│       │   │   │   ├── notification-sms.adapter.ts
│       │   │   │   └── inventory-api.adapter.ts
│       │   │   │
│       │   │   └── mappers/                     # DTO ↔ Domain mappers
│       │   │       ├── order.mapper.ts
│       │   │       └── order-item.mapper.ts
│       │   │
│       │   │
│       │   ├── application/                     # 🔄 APPLICATION LAYER
│       │   │   │                                # Orchestration
│       │   │   │
│       │   │   ├── state/
│       │   │   │   ├── order.state.ts           # State interface
│       │   │   │   └── order.store.ts           # RxJS store
│       │   │   │
│       │   │   ├── facades/
│       │   │   │   └── order.facade.ts          # Main orchestrator
│       │   │   │
│       │   │   └── dto/                         # Application DTOs
│       │   │       ├── create-order.dto.ts
│       │   │       ├── update-order.dto.ts
│       │   │       └── order-filter.dto.ts
│       │   │
│       │   │
│       │   ├── presentation/                    # 🎨 PRESENTATION LAYER
│       │   │   │                                # UI Components
│       │   │   │
│       │   │   ├── pages/                       # Smart components
│       │   │   │   │
│       │   │   │   ├── order-list/
│       │   │   │   │   ├── order-list.component.ts
│       │   │   │   │   ├── order-list.component.html
│       │   │   │   │   ├── order-list.component.scss
│       │   │   │   │   └── order-list.component.spec.ts
│       │   │   │   │
│       │   │   │   ├── order-detail/
│       │   │   │   │   ├── order-detail.component.ts
│       │   │   │   │   ├── order-detail.component.html
│       │   │   │   │   ├── order-detail.component.scss
│       │   │   │   │   ├── order-detail.component.spec.ts
│       │   │   │   │   │
│       │   │   │   │   └── tabs/                # Child routes
│       │   │   │   │       ├── order-info-tab/
│       │   │   │   │       │   ├── order-info-tab.component.ts
│       │   │   │   │       │   ├── order-info-tab.component.html
│       │   │   │   │       │   └── order-info-tab.component.scss
│       │   │   │   │       │
│       │   │   │   │       ├── order-items-tab/
│       │   │   │   │       │   ├── order-items-tab.component.ts
│       │   │   │   │       │   ├── order-items-tab.component.html
│       │   │   │   │       │   └── order-items-tab.component.scss
│       │   │   │   │       │
│       │   │   │   │       ├── order-history-tab/
│       │   │   │   │       │   ├── order-history-tab.component.ts
│       │   │   │   │       │   ├── order-history-tab.component.html
│       │   │   │   │       │   └── order-history-tab.component.scss
│       │   │   │   │       │
│       │   │   │   │       └── order-notes-tab/
│       │   │   │   │           ├── order-notes-tab.component.ts
│       │   │   │   │           ├── order-notes-tab.component.html
│       │   │   │   │           └── order-notes-tab.component.scss
│       │   │   │   │
│       │   │   │   ├── order-create/
│       │   │   │   │   ├── order-create.component.ts
│       │   │   │   │   ├── order-create.component.html
│       │   │   │   │   ├── order-create.component.scss
│       │   │   │   │   └── order-create.component.spec.ts
│       │   │   │   │
│       │   │   │   └── order-edit/
│       │   │   │       ├── order-edit.component.ts
│       │   │   │       ├── order-edit.component.html
│       │   │   │       ├── order-edit.component.scss
│       │   │   │       └── order-edit.component.spec.ts
│       │   │   │
│       │   │   │
│       │   │   ├── components/                  # Dumb components
│       │   │   │   │
│       │   │   │   ├── order-form/
│       │   │   │   │   ├── order-form.component.ts
│       │   │   │   │   ├── order-form.component.html
│       │   │   │   │   ├── order-form.component.scss
│       │   │   │   │   └── order-form.component.spec.ts
│       │   │   │   │
│       │   │   │   ├── order-items-table/
│       │   │   │   │   ├── order-items-table.component.ts
│       │   │   │   │   ├── order-items-table.component.html
│       │   │   │   │   ├── order-items-table.component.scss
│       │   │   │   │   └── order-items-table.component.spec.ts
│       │   │   │   │
│       │   │   │   ├── order-filters/
│       │   │   │   │   ├── order-filters.component.ts
│       │   │   │   │   ├── order-filters.component.html
│       │   │   │   │   └── order-filters.component.scss
│       │   │   │   │
│       │   │   │   ├── order-summary/
│       │   │   │   │   ├── order-summary.component.ts
│       │   │   │   │   ├── order-summary.component.html
│       │   │   │   │   └── order-summary.component.scss
│       │   │   │   │
│       │   │   │   └── order-timeline/
│       │   │   │       ├── order-timeline.component.ts
│       │   │   │       ├── order-timeline.component.html
│       │   │   │       └── order-timeline.component.scss
│       │   │   │
│       │   │   │
│       │   │   └── view-models/
│       │   │       ├── order.view-model.ts
│       │   │       ├── order-detail.view-model.ts
│       │   │       └── order-item.view-model.ts
│       │   │
│       │   │
│       │   ├── order-routing.module.ts
│       │   └── order.module.ts
│       │
│       │
│       ├── customer/                            # ═══════════════════════════════
│       │   │                                    # CUSTOMER FEATURE
│       │   ├── domain/                          # ═══════════════════════════════
│       │   │   ├── models/
│       │   │   │   ├── customer.model.ts
│       │   │   │   └── value-objects/
│       │   │   │       ├── email.vo.ts
│       │   │   │       └── phone.vo.ts
│       │   │   ├── ports/
│       │   │   │   └── customer.repository.interface.ts
│       │   │   └── use-cases/
│       │   │       ├── get-customer-by-id.use-case.ts
│       │   │       └── create-customer.use-case.ts
│       │   │
│       │   ├── infrastructure/
│       │   │   └── repositories/
│       │   │       └── customer-http.repository.ts
│       │   │
│       │   ├── application/
│       │   │   ├── state/
│       │   │   │   └── customer.store.ts
│       │   │   └── facades/
│       │   │       └── customer.facade.ts
│       │   │
│       │   ├── presentation/
│       │   │   ├── pages/
│       │   │   │   ├── customer-list/
│       │   │   │   ├── customer-detail/
│       │   │   │   └── customer-create/
│       │   │   ├── components/
│       │   │   │   └── customer-form/
│       │   │   └── view-models/
│       │   │       └── customer.view-model.ts
│       │   │
│       │   ├── customer-routing.module.ts
│       │   └── customer.module.ts
│       │
│       │
│       ├── product/                             # ═══════════════════════════════
│       │   ├── domain/                          # PRODUCT FEATURE
│       │   ├── infrastructure/                  # ═══════════════════════════════
│       │   ├── application/
│       │   ├── presentation/
│       │   ├── product-routing.module.ts
│       │   └── product.module.ts
│       │
│       │
│       └── dashboard/                           # ═══════════════════════════════
│           ├── presentation/                    # DASHBOARD FEATURE
│           │   └── pages/                       # ═══════════════════════════════
│           │       └── dashboard-home/
│           ├── dashboard-routing.module.ts
│           └── dashboard.module.ts
│
│
├── assets/
│   ├── images/
│   ├── fonts/
│   ├── icons/
│   └── i18n/
│
├── environments/
│   ├── environment.ts
│   └── environment.prod.ts
│
├── styles/
│   ├── _variables.scss
│   ├── _mixins.scss
│   ├── _reset.scss
│   └── styles.scss
│
├── index.html
├── main.ts
└── polyfills.ts
```

---

## Layer Breakdown

### 1. Core Module

```
core/
├── auth/           # Authentication & Authorization
├── error-handling/ # Global error handling
└── services/       # App-wide services
```

**Purpose:** App-wide singletons imported **once** in `AppModule`.

**Examples:**
- Authentication guards
- HTTP interceptors
- Global error handlers
- Event bus service

---

### 2. Shared Module

```
shared/
├── components/     # Generic UI components
├── pipes/          # Reusable pipes
├── directives/     # Reusable directives
├── validators/     # Custom validators
├── utils/          # Utility functions
└── models/         # Generic interfaces
```

**Purpose:** Generic reusable code with **no domain knowledge**.

**Examples:**
- LoadingSpinner
- ErrorMessage
- DateFormatPipe
- ClickOutsideDirective

---

### 3. Domain-Shared Module

```
domain-shared/
└── order-shared/
    ├── components/     # Order-specific shared components
    └── view-models/    # Shared view models
```

**Purpose:** Domain-specific components used **across multiple features**.

**Examples:**
- OrderCard (used in Order, Customer, Dashboard)
- OrderStatusBadge
- CustomerCard

---

### 4. Features

Each feature follows the **4-layer architecture**:

```
features/order/
├── domain/          # 💎 Pure business logic
├── infrastructure/  # 🔌 External dependencies
├── application/     # 🔄 Orchestration
└── presentation/    # 🎨 UI components
```

#### Domain Layer
```
domain/
├── models/          # Entities & Value Objects
├── ports/           # Interfaces
├── services/        # Domain services
├── events/          # Domain events
├── exceptions/      # Custom exceptions
└── use-cases/       # Business operations
```

#### Infrastructure Layer
```
infrastructure/
├── repositories/    # Data access implementations
├── adapters/        # External service adapters
└── mappers/         # DTO ↔ Domain conversion
```

#### Application Layer
```
application/
├── state/           # State management
├── facades/         # Orchestrators
└── dto/             # Application DTOs
```

#### Presentation Layer
```
presentation/
├── pages/           # Smart components (routes)
├── components/      # Dumb components
└── view-models/     # UI data structures
```

---

## Naming Conventions

### Folders
```
✅ kebab-case
order-list/
customer-detail/

❌ PascalCase
OrderList/
CustomerDetail/
```

### Files
```
✅ kebab-case with suffix
order-list.component.ts
create-order.use-case.ts
order.repository.interface.ts

❌ PascalCase or no suffix
OrderList.component.ts
CreateOrder.ts
```

### Classes
```
✅ PascalCase
OrderListComponent
CreateOrderUseCase
IOrderRepository

❌ camelCase
orderListComponent
createOrderUseCase
```

---

## File Suffixes

| Type | Suffix | Example |
|------|--------|---------|
| **Angular Components** | `.component.ts` | `order-list.component.ts` |
| **Angular Services** | `.service.ts` | `auth.service.ts` |
| **Angular Pipes** | `.pipe.ts` | `date-format.pipe.ts` |
| **Angular Directives** | `.directive.ts` | `auto-focus.directive.ts` |
| **Angular Guards** | `.guard.ts` | `auth.guard.ts` |
| **Angular Interceptors** | `.interceptor.ts` | `auth.interceptor.ts` |
| **Domain Models** | `.model.ts` | `order.model.ts` |
| **Value Objects** | `.vo.ts` | `money.vo.ts` |
| **Use Cases** | `.use-case.ts` | `create-order.use-case.ts` |
| **Interfaces** | `.interface.ts` | `order.repository.interface.ts` |
| **Facades** | `.facade.ts` | `order.facade.ts` |
| **Stores** | `.store.ts` | `order.store.ts` |
| **Mappers** | `.mapper.ts` | `order.mapper.ts` |
| **DTOs** | `.dto.ts` | `create-order.dto.ts` |
| **Exceptions** | `.exception.ts` | `invalid-order-state.exception.ts` |
| **Events** | `.event.ts` | `order-created.event.ts` |
| **View Models** | `.view-model.ts` | `order.view-model.ts` |
| **Adapters** | `.adapter.ts` | `payment-stripe.adapter.ts` |
| **State** | `.state.ts` | `order.state.ts` |

---

## Import Rules

### ✅ Allowed Imports

```typescript
// Presentation → Application
import { OrderFacade } from '../../application/facades/order.facade';

// Application → Domain
import { CreateOrderUseCase } from '../../domain/use-cases/create-order.use-case';

// Infrastructure → Domain (implements interface)
import { IOrderRepository } from '../../domain/ports/order.repository.interface';

// Any layer → Shared
import { LoadingSpinnerComponent } from '@shared/components';

// Any layer → Domain-Shared
import { OrderCardComponent } from '@domain-shared/order-shared';
```

### ❌ Forbidden Imports

```typescript
// Domain → Infrastructure (NEVER!)
import { OrderHttpRepository } from '../../infrastructure/repositories/order-http.repository';

// Domain → Application (NEVER!)
import { OrderFacade } from '../../application/facades/order.facade';

// Domain → Angular (NEVER! except @Injectable in use-cases)
import { Component } from '@angular/core';
export class Order { } // Domain should be pure TypeScript
```

---

## Path Aliases

Configure in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "baseUrl": "src",
    "paths": {
      "@core/*": ["app/core/*"],
      "@shared/*": ["app/shared/*"],
      "@domain-shared/*": ["app/domain-shared/*"],
      "@features/*": ["app/features/*"],
      "@environments/*": ["environments/*"]
    }
  }
}
```

### Usage

```typescript
// ✅ Clean imports
import { LoadingSpinnerComponent } from '@shared/components';
import { OrderFacade } from '@features/order/application/facades/order.facade';
import { OrderCardComponent } from '@domain-shared/order-shared';

// ❌ Messy imports
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { OrderFacade } from '../../application/facades/order.facade';
```

---

## Real Example: Order Feature

### Complete Order Feature Structure

```
features/order/
│
├── domain/
│   ├── models/
│   │   ├── order.model.ts
│   │   ├── order-item.model.ts
│   │   └── value-objects/
│   │       ├── money.vo.ts
│   │       └── order-status.vo.ts
│   │
│   ├── ports/
│   │   └── order.repository.interface.ts
│   │
│   └── use-cases/
│       ├── get-order-by-id.use-case.ts
│       ├── get-all-orders.use-case.ts
│       └── create-order.use-case.ts
│
├── infrastructure/
│   └── repositories/
│       └── order-http.repository.ts
│
├── application/
│   ├── state/
│   │   └── order.store.ts
│   └── facades/
│       └── order.facade.ts
│
├── presentation/
│   ├── pages/
│   │   ├── order-list/
│   │   │   ├── order-list.component.ts
│   │   │   ├── order-list.component.html
│   │   │   └── order-list.component.scss
│   │   │
│   │   └── order-detail/
│   │       ├── order-detail.component.ts
│   │       ├── order-detail.component.html
│   │       └── order-detail.component.scss
│   │
│   ├── components/
│   │   └── order-form/
│   │       ├── order-form.component.ts
│   │       ├── order-form.component.html
│   │       └── order-form.component.scss
│   │
│   └── view-models/
│       └── order.view-model.ts
│
├── order-routing.module.ts
└── order.module.ts
```

### File Count Guidelines

| Feature Size | File Count | Action |
|--------------|------------|--------|
| **Small** | < 20 files | Keep as single module |
| **Medium** | 20-50 files | Consider sub-modules |
| **Large** | 50-100 files | Split by subdomain |
| **Extra Large** | > 100 files | Split into multiple features |

---

## Barrel Exports

Create `index.ts` files for cleaner imports:

```typescript
// features/order/domain/models/index.ts
export * from './order.model';
export * from './order-item.model';
export * from './value-objects/money.vo';
export * from './value-objects/order-status.vo';

// Usage
import { Order, OrderItem, Money, OrderStatus } from '../../domain/models';
// Instead of 4 separate imports!
```

---

## Quick Checklist

When creating a new feature:

```
☐ Create feature folder in features/
☐ Create domain/ with models, use-cases, ports
☐ Create infrastructure/ with repositories
☐ Create application/ with facade, store
☐ Create presentation/ with pages, components
☐ Create routing module
☐ Create feature module
☐ Add to app-routing.module.ts
☐ Create barrel exports (index.ts)
☐ Write tests for each layer
```

---

## Summary

**Key Principles:**

1. ✅ **4 layers per feature** (Domain, Infrastructure, Application, Presentation)
2. ✅ **Clear naming conventions** (kebab-case, proper suffixes)
3. ✅ **Strict import rules** (no upward dependencies)
4. ✅ **Path aliases** for clean imports
5. ✅ **Barrel exports** to reduce import clutter

**Next Steps:**

- [Domain Layer Deep Dive →](03-domain-layer.md)
- [See Complete Order Example →](../../examples/order-system/01-domain-models.md)

---

**Navigation:**

[← Overview](01-overview.md) | [Domain Layer →](03-domain-layer.md)
```

---

Save this as `docs/architecture/02-complete-folder-structure.md`.

**Ready for the next file?** Let me know! 🚀

---
---

# PART 3: REAL-WORLD EXAMPLES

## **7. Real Angular DDD + Hexagonal Architecture Examples**

Perfect! I found some excellent real-world examples and resources for you. Here are the best GitHub repositories and articles:

---

### **🔥 Top GitHub Repositories**

#### **1. Sairyss/domain-driven-hexagon** ⭐ (Most Comprehensive)
**Repository:** [https://github.com/Sairyss/domain-driven-hexagon](https://github.com/Sairyss/domain-driven-hexagon)
**Article:** [https://dev.to/sairyss/domain-driven-hexagon-18g5](https://dev.to/sairyss/domain-driven-hexagon-18g5)

**Why it's great:**
- Comprehensive guide on DDD + Hexagonal Architecture
- Uses TypeScript (easily adaptable to Angular)
- Real-world patterns: ports, adapters, use cases, domain models
- Includes diagrams and best practices
- Shows how to structure folders, handle errors, and test

**What you'll learn:**
```
✅ Port/Adapter pattern implementation
✅ Domain layer isolation
✅ Use case orchestration
✅ Repository pattern with interfaces
✅ Value Objects and Entities
✅ Testing strategies
```

---

#### **2. Hexagonal Architecture with Angular - Tour of Heroes Example**
**Article:** [https://dev.to/aurelien_alet/hexagonal-architecture-with-angular-8ll](https://dev.to/aurelien_alet/hexagonal-architecture-with-angular-8ll)

**Why it's great:**
- **Angular-specific implementation** (exactly what you need!)
- Uses the classic "Tour of Heroes" app
- Shows how to apply hexagonal architecture in **frontend**
- Clear separation: Domain → Application → Infrastructure → Presentation

**Structure they use:**
```
src/
├── domain/           # Business logic
├── application/      # Use cases & orchestration  
├── infrastructure/   # API, LocalStorage adapters
└── presentation/     # Angular components
```

---

#### **3. Angular Architects - DDD in Angular & Frontend Architecture**
**Article:** [https://www.angulararchitects.io/blog/all-about-ddd-for-frontend-architectures-with-angular-co/](https://www.angulararchitects.io/blog/all-about-ddd-for-frontend-architectures-with-angular-co/)

**Why it's great:**
- Written by **Manfred Steyer** (Angular expert, Nx contributor)
- Enterprise-level Angular DDD patterns
- Explains **Bounded Contexts** in frontend
- Shows how to use **Nx monorepo** with DDD
- Strategic design for large Angular apps

**Key concepts:**
```
✅ Feature modules as bounded contexts
✅ Vertical slicing vs horizontal layers
✅ Shared Kernel pattern
✅ Micro frontends with DDD
✅ Module boundaries enforcement
```

---

#### **4. GitHub Topic: Hexagonal Architecture**
**Browse:** [https://github.com/topics/hexagonal-architecture](https://github.com/topics/hexagonal-architecture)

**What you'll find:**
- 1000+ repositories with hexagonal architecture
- Many TypeScript examples
- Frontend and backend implementations
- Various frameworks (Angular, React, Vue, NestJS)

**How to search:**
- Filter by **TypeScript** language
- Look for **frontend** or **Angular** in descriptions
- Check stars and recent activity

---

### **📚 Additional Excellent Resources**

#### **5. bespoyasov/frontend-clean-architecture** 
**Repository:** [https://github.com/bespoyasov/frontend-clean-architecture](https://github.com/bespoyasov/frontend-clean-architecture)
**Live Demo:** [https://bespoyasov.ru/showcase/frontend-clean-architecture/](https://bespoyasov.ru/showcase/frontend-clean-architecture/)

**Why it's great:**
- **React example** but patterns apply to Angular
- Clean Architecture in frontend (similar to Hexagonal)
- Shows domain models, use cases, adapters
- Real working application with source code
- Excellent diagrams and documentation

---

#### **6. Key Articles to Read**

**DDD, Hexagonal, Onion, Clean, CQRS - How I put it all together:**
[https://herbertograca.com/2017/11/16/explicit-architecture-01-ddd-hexagonal-onion-clean-cqrs-how-i-put-it-all-together/](https://herbertograca.com/2017/11/16/explicit-architecture-01-ddd-hexagonal-onion-clean-cqrs-how-i-put-it-all-together/)

**What it covers:**
- How all these architectures relate
- When to use which pattern
- Complete architecture diagram
- Real-world implementation guide

---

### **🎯 How to Apply These to Your Angular Project**

#### **Step 1: Study These Examples in Order**

1. **Start with:** [Hexagonal Architecture with Angular](https://dev.to/aurelien_alet/hexagonal-architecture-with-angular-8ll) - Most directly applicable
2. **Deep dive:** [domain-driven-hexagon](https://github.com/Sairyss/domain-driven-hexagon) - Learn patterns deeply
3. **Scale up:** [Angular Architects DDD](https://www.angulararchitects.io/blog/all-about-ddd-for-frontend-architectures-with-angular-co/) - Enterprise patterns

#### **Step 2: Compare Patterns**

Create a table comparing:
- Your current Order System structure (we built together)
- The Angular hexagonal example structure
- The domain-driven-hexagon patterns

#### **Step 3: Adapt to Your Context**

Pick patterns that solve YOUR problems:
- Small team? → Keep it simple, focus on domain isolation
- Large enterprise? → Add bounded contexts, shared kernel
- Complex business rules? → Heavy use of domain services

---

### **🔍 Key Patterns to Look For in These Examples**

When studying these repositories, pay attention to:

| Pattern | What to Look For | Why It Matters |
|---------|------------------|----------------|
| **Port/Adapter** | Interfaces in domain, implementations in infrastructure | Testability & flexibility |
| **Use Cases** | Single-responsibility classes for business operations | Clear business logic |
| **Facades** | Orchestration layer between UI and domain | Simplified component code |
| **Value Objects** | Immutable objects with business validation | Data integrity |
| **Repository Pattern** | Abstract data access behind interfaces | Technology independence |
| **Domain Events** | Events raised by domain operations | Decoupling & extensibility |

---

### **💡 Practical Next Steps for You**

1. **Clone one of these repos** (I recommend the Angular hexagonal example)
2. **Run it locally** and explore the structure
3. **Compare** with our Order System example
4. **Identify** 2-3 patterns you want to add to your project
5. **Implement** incrementally in your upcoming features

---

### **🚀 Quick Reference Comparison**

**Your Order System (what we built):**
```
✅ Domain models (Order, OrderItem, Money)
✅ Use cases (GetOrderById, CreateOrder)
✅ Repository interface (IOrderRepository)
✅ Facade pattern (OrderFacade)
✅ State management (OrderStore)
✅ Clean separation of layers
```

**What you can add from these examples:**
```
🔥 Domain events (OrderCreated, OrderCancelled)
🔥 Domain services (OrderValidationService)
🔥 CQRS pattern (separate read/write models)
🔥 Event bus for cross-feature communication
🔥 Advanced error handling strategies
🔥 Bounded contexts for multiple features
```

---

### **📖 Recommended Reading Order**

**Week 1:** Angular-specific implementation
- Read: [Hexagonal Architecture with Angular](https://dev.to/aurelien_alet/hexagonal-architecture-with-angular-8ll)
- Action: Sketch how it compares to your Order System

**Week 2:** Deep dive into patterns
- Read: [domain-driven-hexagon](https://github.com/Sairyss/domain-driven-hexagon)
- Action: Identify 3 patterns to adopt

**Week 3:** Enterprise scaling
- Read: [Angular Architects DDD](https://www.angulararchitects.io/blog/all-about-ddd-for-frontend-architectures-with-angular-co/)
- Action: Plan bounded contexts for your app

**Week 4:** Combine everything
- Read: [Explicit Architecture](https://herbertograca.com/2017/11/16/explicit-architecture-01-ddd-hexagonal-onion-clean-cqrs-how-i-put-it-all-together/)
- Action: Refine your architecture diagram

---

## **Summary**

You now have:
1. ✅ **Complete Order System** with DDD + Hexagonal Architecture
2. ✅ **Real-world Angular examples** to study
3. ✅ **Learning path** to deepen your knowledge
4. ✅ **Practical patterns** ready to implement

**Your architecture is already solid!** The examples above will help you:
- Validate your approach
- Learn advanced patterns
- Scale to enterprise needs
- Handle edge cases

---

**Questions for you:**

1. Which example would you like me to dive deeper into?
2. Should I help you add any specific pattern (like Domain Events or CQRS) to your Order System?
3. Do you want guidance on testing this architecture?

Let me know how you'd like to proceed! 🎯

---
---

# PART 4: IMPLEMENTATION GUIDE

## **📁 Complete Folder Structure - DDD + Hexagonal Architecture in Angular**

### **Updated with All Best Practices**

```
src/
├── app/
│   │
│   ├── core/                                    # 🌐 CORE - App-wide Singletons
│   │   ├── auth/
│   │   │   ├── guards/
│   │   │   │   ├── auth.guard.ts
│   │   │   │   └── role.guard.ts
│   │   │   ├── interceptors/
│   │   │   │   ├── auth.interceptor.ts
│   │   │   │   └── error.interceptor.ts
│   │   │   └── services/
│   │   │       └── auth.service.ts
│   │   │
│   │   ├── error-handling/
│   │   │   ├── global-error-handler.ts
│   │   │   └── error-logger.service.ts
│   │   │
│   │   ├── services/
│   │   │   ├── event-bus.service.ts
│   │   │   └── notification.service.ts
│   │   │
│   │   └── core.module.ts
│   │
│   │
│   ├── shared/                                  # 🔧 SHARED - Generic Components
│   │   │
│   │   ├── components/                          # Generic UI Components
│   │   │   ├── loading-spinner/
│   │   │   │   ├── loading-spinner.component.ts
│   │   │   │   ├── loading-spinner.component.html
│   │   │   │   └── loading-spinner.component.scss
│   │   │   │
│   │   │   ├── error-message/
│   │   │   │   ├── error-message.component.ts
│   │   │   │   ├── error-message.component.html
│   │   │   │   └── error-message.component.scss
│   │   │   │
│   │   │   ├── confirmation-dialog/
│   │   │   │   ├── confirmation-dialog.component.ts
│   │   │   │   ├── confirmation-dialog.component.html
│   │   │   │   └── confirmation-dialog.component.scss
│   │   │   │
│   │   │   ├── data-table/
│   │   │   │   ├── data-table.component.ts
│   │   │   │   ├── data-table.component.html
│   │   │   │   └── data-table.component.scss
│   │   │   │
│   │   │   ├── button/
│   │   │   │   ├── button.component.ts
│   │   │   │   └── button.component.scss
│   │   │   │
│   │   │   └── modal/
│   │   │       ├── modal.component.ts
│   │   │       ├── modal.component.html
│   │   │       └── modal.component.scss
│   │   │
│   │   ├── pipes/                               # Generic Pipes
│   │   │   ├── currency-format.pipe.ts
│   │   │   ├── date-format.pipe.ts
│   │   │   └── truncate.pipe.ts
│   │   │
│   │   ├── directives/                          # Generic Directives
│   │   │   ├── auto-focus.directive.ts
│   │   │   ├── click-outside.directive.ts
│   │   │   └── debounce-click.directive.ts
│   │   │
│   │   ├── validators/                          # Custom Validators
│   │   │   ├── email-validator.ts
│   │   │   └── phone-validator.ts
│   │   │
│   │   ├── utils/                               # Utility Functions
│   │   │   ├── date.utils.ts
│   │   │   ├── string.utils.ts
│   │   │   └── array.utils.ts
│   │   │
│   │   ├── models/                              # Generic Interfaces
│   │   │   ├── pagination.model.ts
│   │   │   └── api-response.model.ts
│   │   │
│   │   ├── index.ts                             # Barrel export
│   │   └── shared.module.ts
│   │
│   │
│   ├── domain-shared/                           # 🎯 DOMAIN-SHARED - Cross-Feature Domain
│   │   │
│   │   ├── order-shared/                        # Order domain shared components
│   │   │   ├── components/
│   │   │   │   ├── order-card/
│   │   │   │   │   ├── order-card.component.ts
│   │   │   │   │   ├── order-card.component.html
│   │   │   │   │   └── order-card.component.scss
│   │   │   │   │
│   │   │   │   └── order-status-badge/
│   │   │   │       ├── order-status-badge.component.ts
│   │   │   │       ├── order-status-badge.component.html
│   │   │   │       └── order-status-badge.component.scss
│   │   │   │
│   │   │   ├── view-models/
│   │   │   │   └── order-shared.view-model.ts
│   │   │   │
│   │   │   ├── index.ts
│   │   │   └── order-shared.module.ts
│   │   │
│   │   └── customer-shared/                     # Customer domain shared components
│   │       ├── components/
│   │       │   └── customer-card/
│   │       │       ├── customer-card.component.ts
│   │       │       ├── customer-card.component.html
│   │       │       └── customer-card.component.scss
│   │       │
│   │       ├── index.ts
│   │       └── customer-shared.module.ts
│   │
│   │
│   └── features/                                # 🎨 FEATURES - Business Features
│       │
│       │
│       ├── order/                               # ═══════════════════════════════
│       │   │                                    # ORDER FEATURE (Complete Example)
│       │   │                                    # ═══════════════════════════════
│       │   │
│       │   ├── domain/                          # 💎 DOMAIN LAYER
│       │   │   │                                # Pure business logic (NO Angular)
│       │   │   │
│       │   │   ├── models/                      # Entities & Aggregates
│       │   │   │   ├── order.model.ts           # Order entity (root aggregate)
│       │   │   │   ├── order-item.model.ts      # Order item entity
│       │   │   │   │
│       │   │   │   └── value-objects/           # Value Objects (immutable)
│       │   │   │       ├── money.vo.ts
│       │   │   │       ├── order-status.vo.ts
│       │   │   │       └── address.vo.ts
│       │   │   │
│       │   │   ├── ports/                       # Interfaces (Contracts)
│       │   │   │   ├── order.repository.interface.ts
│       │   │   │   ├── payment.service.interface.ts
│       │   │   │   └── notification.service.interface.ts
│       │   │   │
│       │   │   ├── services/                    # Domain Services
│       │   │   │   ├── order-validation.service.ts
│       │   │   │   └── order-pricing.service.ts
│       │   │   │
│       │   │   ├── events/                      # Domain Events
│       │   │   │   ├── order-created.event.ts
│       │   │   │   ├── order-confirmed.event.ts
│       │   │   │   └── order-cancelled.event.ts
│       │   │   │
│       │   │   ├── exceptions/                  # Domain Exceptions
│       │   │   │   ├── domain-exception.ts
│       │   │   │   ├── invalid-order-state.exception.ts
│       │   │   │   └── insufficient-inventory.exception.ts
│       │   │   │
│       │   │   └── use-cases/                   # Business Use Cases
│       │   │       ├── get-order-by-id.use-case.ts
│       │   │       ├── get-all-orders.use-case.ts
│       │   │       ├── create-order.use-case.ts
│       │   │       ├── update-order.use-case.ts
│       │   │       ├── cancel-order.use-case.ts
│       │   │       ├── confirm-order.use-case.ts
│       │   │       └── calculate-order-total.use-case.ts
│       │   │
│       │   │
│       │   ├── infrastructure/                  # 🔌 INFRASTRUCTURE LAYER
│       │   │   │                                # External dependencies
│       │   │   │
│       │   │   ├── repositories/                # Repository Implementations
│       │   │   │   ├── order-http.repository.ts # HTTP implementation
│       │   │   │   └── order-mock.repository.ts # Mock for testing
│       │   │   │
│       │   │   ├── adapters/                    # External Service Adapters
│       │   │   │   ├── payment-stripe.adapter.ts
│       │   │   │   ├── notification-email.adapter.ts
│       │   │   │   └── storage-local.adapter.ts
│       │   │   │
│       │   │   └── mappers/                     # DTO ↔ Domain Mappers
│       │   │       ├── order.mapper.ts
│       │   │       └── order-item.mapper.ts
│       │   │
│       │   │
│       │   ├── application/                     # 🔄 APPLICATION LAYER
│       │   │   │                                # Orchestration
│       │   │   │
│       │   │   ├── state/                       # State Management
│       │   │   │   ├── order.state.ts           # State interface
│       │   │   │   └── order.store.ts           # RxJS-based store
│       │   │   │
│       │   │   ├── facades/                     # Facades (Orchestrators)
│       │   │   │   └── order.facade.ts          # Main facade for UI
│       │   │   │
│       │   │   └── dto/                         # Application DTOs
│       │   │       ├── create-order.dto.ts
│       │   │       └── update-order.dto.ts
│       │   │
│       │   │
│       │   ├── presentation/                    # 🎨 PRESENTATION LAYER
│       │   │   │                                # UI Components
│       │   │   │
│       │   │   ├── pages/                       # 📄 SMART COMPONENTS (Pages)
│       │   │   │   │                            # - Know about Facade
│       │   │   │   │                            # - Handle routing
│       │   │   │   │                            # - Orchestrate data
│       │   │   │   │
│       │   │   │   ├── order-list/              # List page
│       │   │   │   │   ├── order-list.component.ts
│       │   │   │   │   ├── order-list.component.html
│       │   │   │   │   ├── order-list.component.scss
│       │   │   │   │   └── order-list.component.spec.ts
│       │   │   │   │
│       │   │   │   ├── order-detail/            # Detail page (with tabs)
│       │   │   │   │   ├── order-detail.component.ts
│       │   │   │   │   ├── order-detail.component.html
│       │   │   │   │   ├── order-detail.component.scss
│       │   │   │   │   ├── order-detail.component.spec.ts
│       │   │   │   │   │
│       │   │   │   │   └── tabs/                # Child routes (sub-pages)
│       │   │   │   │       ├── order-info-tab/
│       │   │   │   │       │   ├── order-info-tab.component.ts
│       │   │   │   │       │   ├── order-info-tab.component.html
│       │   │   │   │       │   └── order-info-tab.component.scss
│       │   │   │   │       │
│       │   │   │   │       ├── order-items-tab/
│       │   │   │   │       │   ├── order-items-tab.component.ts
│       │   │   │   │       │   ├── order-items-tab.component.html
│       │   │   │   │       │   └── order-items-tab.component.scss
│       │   │   │   │       │
│       │   │   │   │       ├── order-history-tab/
│       │   │   │   │       │   ├── order-history-tab.component.ts
│       │   │   │   │       │   ├── order-history-tab.component.html
│       │   │   │   │       │   └── order-history-tab.component.scss
│       │   │   │   │       │
│       │   │   │   │       └── order-notes-tab/
│       │   │   │   │           ├── order-notes-tab.component.ts
│       │   │   │   │           ├── order-notes-tab.component.html
│       │   │   │   │           └── order-notes-tab.component.scss
│       │   │   │   │
│       │   │   │   ├── order-create/            # Create page
│       │   │   │   │   ├── order-create.component.ts
│       │   │   │   │   ├── order-create.component.html
│       │   │   │   │   ├── order-create.component.scss
│       │   │   │   │   └── order-create.component.spec.ts
│       │   │   │   │
│       │   │   │   └── order-edit/              # Edit page
│       │   │   │       ├── order-edit.component.ts
│       │   │   │       ├── order-edit.component.html
│       │   │   │       ├── order-edit.component.scss
│       │   │   │       └── order-edit.component.spec.ts
│       │   │   │
│       │   │   │
│       │   │   ├── components/                  # 🧩 DUMB COMPONENTS
│       │   │   │   │                            # - Only used in Order feature
│       │   │   │   │                            # - Receive data via @Input
│       │   │   │   │                            # - Emit events via @Output
│       │   │   │   │                            # - NO business logic
│       │   │   │   │
│       │   │   │   ├── order-form/              # Reusable form (create & edit)
│       │   │   │   │   ├── order-form.component.ts
│       │   │   │   │   ├── order-form.component.html
│       │   │   │   │   ├── order-form.component.scss
│       │   │   │   │   └── order-form.component.spec.ts
│       │   │   │   │
│       │   │   │   ├── order-items-table/       # Items table
│       │   │   │   │   ├── order-items-table.component.ts
│       │   │   │   │   ├── order-items-table.component.html
│       │   │   │   │   ├── order-items-table.component.scss
│       │   │   │   │   └── order-items-table.component.spec.ts
│       │   │   │   │
│       │   │   │   ├── order-filters/           # Filter component
│       │   │   │   │   ├── order-filters.component.ts
│       │   │   │   │   ├── order-filters.component.html
│       │   │   │   │   └── order-filters.component.scss
│       │   │   │   │
│       │   │   │   ├── order-summary/           # Summary component
│       │   │   │   │   ├── order-summary.component.ts
│       │   │   │   │   ├── order-summary.component.html
│       │   │   │   │   └── order-summary.component.scss
│       │   │   │   │
│       │   │   │   └── order-timeline/          # Timeline component
│       │   │   │       ├── order-timeline.component.ts
│       │   │   │       ├── order-timeline.component.html
│       │   │   │       └── order-timeline.component.scss
│       │   │   │
│       │   │   │
│       │   │   └── view-models/                 # View Models
│       │   │       ├── order.view-model.ts
│       │   │       ├── order-detail.view-model.ts
│       │   │       └── order-item.view-model.ts
│       │   │
│       │   │
│       │   ├── order-routing.module.ts          # Routing
│       │   └── order.module.ts                  # Module definition
│       │
│       │
│       ├── customer/                            # ═══════════════════════════════
│       │   │                                    # CUSTOMER FEATURE
│       │   │                                    # ═══════════════════════════════
│       │   │
│       │   ├── domain/
│       │   │   ├── models/
│       │   │   │   ├── customer.model.ts
│       │   │   │   └── value-objects/
│       │   │   │       ├── email.vo.ts
│       │   │   │       └── phone.vo.ts
│       │   │   │
│       │   │   ├── ports/
│       │   │   │   └── customer.repository.interface.ts
│       │   │   │
│       │   │   └── use-cases/
│       │   │       ├── get-customer-by-id.use-case.ts
│       │   │       ├── get-all-customers.use-case.ts
│       │   │       └── create-customer.use-case.ts
│       │   │
│       │   ├── infrastructure/
│       │   │   └── repositories/
│       │   │       └── customer-http.repository.ts
│       │   │
│       │   ├── application/
│       │   │   ├── state/
│       │   │   │   └── customer.store.ts
│       │   │   └── facades/
│       │   │       └── customer.facade.ts
│       │   │
│       │   ├── presentation/
│       │   │   ├── pages/
│       │   │   │   ├── customer-list/
│       │   │   │   │   ├── customer-list.component.ts
│       │   │   │   │   ├── customer-list.component.html
│       │   │   │   │   └── customer-list.component.scss
│       │   │   │   │
│       │   │   │   ├── customer-detail/
│       │   │   │   │   ├── customer-detail.component.ts
│       │   │   │   │   ├── customer-detail.component.html
│       │   │   │   │   └── customer-detail.component.scss
│       │   │   │   │
│       │   │   │   └── customer-create/
│       │   │   │       ├── customer-create.component.ts
│       │   │   │       ├── customer-create.component.html
│       │   │   │       └── customer-create.component.scss
│       │   │   │
│       │   │   ├── components/
│       │   │   │   ├── customer-form/
│       │   │   │   └── customer-address-form/
│       │   │   │
│       │   │   └── view-models/
│       │   │       └── customer.view-model.ts
│       │   │
│       │   ├── customer-routing.module.ts
│       │   └── customer.module.ts
│       │
│       │
│       ├── product/                             # ═══════════════════════════════
│       │   │                                    # PRODUCT FEATURE (Minimal)
│       │   ├── domain/                          # ═══════════════════════════════
│       │   ├── infrastructure/
│       │   ├── application/
│       │   ├── presentation/
│       │   ├── product-routing.module.ts
│       │   └── product.module.ts
│       │
│       │
│       └── dashboard/                           # ═══════════════════════════════
│           │                                    # DASHBOARD FEATURE
│           ├── presentation/                    # ═══════════════════════════════
│           │   └── pages/
│           │       └── dashboard-home/
│           │           ├── dashboard-home.component.ts
│           │           ├── dashboard-home.component.html
│           │           └── dashboard-home.component.scss
│           │
│           ├── dashboard-routing.module.ts
│           └── dashboard.module.ts
│
│
├── assets/                                      # Static Assets
│   ├── images/
│   ├── fonts/
│   └── i18n/
│
├── environments/                                # Environment Config
│   ├── environment.ts
│   └── environment.prod.ts
│
├── styles/                                      # Global Styles
│   ├── _variables.scss
│   ├── _mixins.scss
│   └── styles.scss
│
├── index.html
├── main.ts
└── polyfills.ts
```

---

## **📝 Key Notes & Principles**

### **1. Layer Responsibilities**

```typescript
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                        │
│  • Pages (Smart Components) - Know about Facade             │
│  • Components (Dumb Components) - Pure UI                   │
│  • View Models - UI-specific data structures                │
└────────────────────────┬────────────────────────────────────┘
                         │ Uses
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   APPLICATION LAYER                          │
│  • Facades - Orchestrate use cases & state                  │
│  • State/Store - Manage application state                   │
│  • DTOs - Data transfer objects                             │
└────────────────────────┬────────────────────────────────────┘
                         │ Uses
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                     DOMAIN LAYER                             │
│  • Entities - Business objects with identity                │
│  • Value Objects - Immutable values                         │
│  • Use Cases - Business operations                          │
│  • Ports (Interfaces) - Contracts                           │
│  • Domain Services - Business logic across entities         │
│  • Domain Events - Business state changes                   │
└────────────────────────┬────────────────────────────────────┘
                         │ Implemented by
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  INFRASTRUCTURE LAYER                        │
│  • Repositories - Data access implementations               │
│  • Adapters - External service implementations              │
│  • Mappers - DTO ↔ Domain conversion                       │
└─────────────────────────────────────────────────────────────┘
```

---

### **2. Dependency Rules**

```
✅ ALLOWED:
Presentation → Application → Domain ← Infrastructure

❌ FORBIDDEN:
Domain → Infrastructure (Domain never depends on Infrastructure)
Domain → Application (Domain never depends on Application)
Domain → Presentation (Domain never depends on UI)
```

---

### **3. Component Classification**

| Type | Location | Knows About | Example |
|------|----------|-------------|---------|
| **Page (Smart)** | `features/*/presentation/pages/` | Facade, Router, State | OrderListComponent |
| **Component (Dumb)** | `features/*/presentation/components/` | Only @Input/@Output | OrderFormComponent |
| **Shared Generic** | `shared/components/` | Nothing (pure UI) | LoadingSpinnerComponent |
| **Domain Shared** | `domain-shared/*/components/` | View Models only | OrderCardComponent |

---

### **4. Import Rules**

```typescript
// ✅ GOOD: Feature imports from shared
import { LoadingSpinnerComponent } from '@shared/components';
import { OrderCardComponent } from '@domain-shared/order-shared';

// ✅ GOOD: Application imports from domain
import { CreateOrderUseCase } from '../../domain/use-cases/create-order.use-case';
import { IOrderRepository } from '../../domain/ports/order.repository.interface';

// ❌ BAD: Domain imports from infrastructure
import { OrderHttpRepository } from '../../infrastructure/repositories/order-http.repository';
// Domain should NEVER know about infrastructure!

// ❌ BAD: Domain imports Angular
import { Injectable } from '@angular/core';
// Domain should be pure TypeScript! (except use cases can use @Injectable)
```

---

### **5. Folder Naming Conventions**

```
📁 Folders: kebab-case
   ✅ order-list/
   ✅ customer-detail/
   ❌ OrderList/
   ❌ customerDetail/

📄 Files: kebab-case with suffix
   ✅ order-list.component.ts
   ✅ create-order.use-case.ts
   ✅ order.repository.interface.ts
   ❌ OrderList.component.ts
   ❌ CreateOrder.ts

🏷️ Classes: PascalCase
   ✅ OrderListComponent
   ✅ CreateOrderUseCase
   ✅ IOrderRepository
```

---

### **6. File Suffixes**

```typescript
.component.ts      // Angular components
.service.ts        // Angular services
.pipe.ts           // Angular pipes
.directive.ts      // Angular directives
.guard.ts          // Route guards
.interceptor.ts    // HTTP interceptors

.model.ts          // Domain entities
.vo.ts             // Value objects
.use-case.ts       // Use cases
.interface.ts      // Interfaces
.facade.ts         // Facades
.store.ts          // State stores
.mapper.ts         // Mappers
.dto.ts            // DTOs
.exception.ts      // Custom exceptions
.event.ts          // Domain events
.view-model.ts     // View models
```

---

### **7. When to Create New Pages vs Components**

#### **Create a NEW PAGE when:**
```
✅ It needs its own route (/orders/create)
✅ It's a full-screen view
✅ It orchestrates business logic
✅ It uses Facade/Services
✅ It handles navigation
```

#### **Create a COMPONENT when:**
```
✅ It's reusable across pages
✅ It only displays data (@Input)
✅ It has no business logic
✅ It's part of a page (not full-screen)
```

#### **Use TABS/CHILD ROUTES when:**
```
✅ Single page has 3+ sections
✅ Each section is complex (> 200 lines)
✅ Sections can be deep-linked
✅ Better lazy loading needed
```

---

### **8. Shared Components Decision Tree**

```
Where to put a component?
│
├─ Is it generic (button, modal, spinner)?
│  └─ YES → shared/components/
│
├─ Is it domain-specific but used across features?
│  └─ YES → domain-shared/order-shared/components/
│
└─ Is it only used within one feature?
   └─ YES → features/order/presentation/components/
```

---

### **9. Module Dependencies**

```
Core Module
   ↑
   │ imported by
   │
App Module
   │
   │ lazy loads
   │
   ├─→ Order Module
   │      │
   │      ├─ imports SharedModule
   │      └─ imports OrderSharedModule (from domain-shared)
   │
   ├─→ Customer Module
   │      │
   │      ├─ imports SharedModule
   │      └─ imports OrderSharedModule (to show customer orders)
   │
   └─→ Product Module
          └─ imports SharedModule
```

---

### **10. Testing Structure**

```
src/
└── app/
    └── features/
        └── order/
            ├── domain/
            │   └── use-cases/
            │       └── create-order.use-case.spec.ts    # Pure unit tests
            │
            ├── application/
            │   └── facades/
            │       └── order.facade.spec.ts             # Integration tests
            │
            └── presentation/
                ├── pages/
                │   └── order-list/
                │       └── order-list.component.spec.ts # Component tests
                │
                └── components/
                    └── order-card/
                        └── order-card.component.spec.ts # Pure unit tests
```

---

### **11. Barrel Exports (index.ts)**

Use barrel exports for cleaner imports:

```typescript
// features/order/domain/models/index.ts
export * from './order.model';
export * from './order-item.model';
export * from './value-objects/money.vo';
export * from './value-objects/order-status.vo';

// Usage:
import { Order, OrderItem, Money, OrderStatus } from '../../domain/models';
// Instead of 4 separate imports!
```

---

### **12. Path Aliases (tsconfig.json)**

```json
{
  "compilerOptions": {
    "paths": {
      "@core/*": ["src/app/core/*"],
      "@shared/*": ["src/app/shared/*"],
      "@domain-shared/*": ["src/app/domain-shared/*"],
      "@features/*": ["src/app/features/*"],
      "@environments/*": ["src/environments/*"]
    }
  }
}
```

**Usage:**
```typescript
// ✅ Clean imports
import { LoadingSpinnerComponent } from '@shared/components';
import { OrderFacade } from '@features/order/application/facades/order.facade';

// ❌ Messy imports
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
```

---

### **13. Feature Module Size Guidelines**

| Feature Size | Number of Files | When to Split |
|--------------|-----------------|---------------|
| **Small** | < 20 files | Single module |
| **Medium** | 20-50 files | Consider sub-modules |
| **Large** | 50-100 files | Use sub-modules by subdomain |
| **Extra Large** | > 100 files | Split into multiple features |

---

### **14. Real-World Scaling Example**

```
As your app grows:

Phase 1 (Small): 1-5 features
features/
├── order/
├── customer/
└── product/

Phase 2 (Medium): 5-15 features
features/
├── order/
├── customer/
├── product/
├── inventory/
├── shipping/
└── analytics/

Phase 3 (Large): 15+ features, Split by Bounded Context
features/
├── sales/              # Sales Bounded Context
│   ├── order/
│   ├── quote/
│   └── invoice/
│
├── crm/                # CRM Bounded Context
│   ├── customer/
│   ├── contact/
│   └── lead/
│
└── logistics/          # Logistics Bounded Context
    ├── inventory/
    ├── shipping/
    └── warehouse/
```

---

### **15. Quick Reference Checklist**

When adding a new feature:

```
☐ Create feature folder in features/
☐ Create domain/ folder (models, use-cases, ports)
☐ Create infrastructure/ folder (repositories, adapters)
☐ Create application/ folder (facade, store)
☐ Create presentation/ folder (pages, components, view-models)
☐ Create routing module
☐ Create feature module
☐ Register in app-routing.module.ts
☐ Add barrel exports (index.ts)
☐ Write tests for each layer
☐ Update documentation
```

---

## **🎯 Summary**

This structure provides:

1. ✅ **Clear separation of concerns** (Domain, Application, Infrastructure, Presentation)
2. ✅ **Scalability** (Easy to add new features)
3. ✅ **Testability** (Each layer can be tested independently)
4. ✅ **Maintainability** (Easy to find and modify code)
5. ✅ **Reusability** (Shared components at multiple levels)
6. ✅ **Team collaboration** (Clear boundaries, less conflicts)
7. ✅ **Technology independence** (Easy to swap implementations)

---

**User:** @lalitp26  
**Date:** 2025-10-25 06:34:48 UTC  

**Next Steps:**
1. Would you like me to create a migration guide from your current structure?
2. Need help with a specific feature implementation?
3. Want to see how to implement authentication in this structure?

Let me know! 🚀

---
---

# DOCUMENT END

Total: 4 Parts Merged
Ready for Printing
