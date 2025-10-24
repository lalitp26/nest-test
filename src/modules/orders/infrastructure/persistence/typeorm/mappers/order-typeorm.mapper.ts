import { Injectable } from '@nestjs/common';
import { Order, OrderStatus } from '../../../../domain/entities/order.entity';
import { OrderItem } from '../../../../domain/value-objects/order-item.vo';
import { OrderTypeormEntity } from '../entities/order.typeorm-entity';

@Injectable()
export class OrderTypeormMapper {
  toDomain(entity: OrderTypeormEntity): Order {
    const items = entity.items.map(
      item => new OrderItem(item.productId, item.quantity, item.price),
    );

    return Order.reconstitute(
      entity.id,
      entity.customerId,
      items,
      entity.status as OrderStatus,
      entity.createdAt,
      entity.updatedAt,
    );
  }

  toPersistence(domain: Order): OrderTypeormEntity {
    const entity = new OrderTypeormEntity();
    entity.id = domain.id;
    entity.customerId = domain.customerId;
    entity.items = domain.items.map(item => ({
      productId: item.productId,
      quantity: item.quantity,
      price: item.price,
    }));
    entity.status = domain.status;
    entity.createdAt = domain.createdAt;
    entity.updatedAt = domain.updatedAt;
    return entity;
  }

  toDomainList(entities: OrderTypeormEntity[]): Order[] {
    return entities.map(entity => this.toDomain(entity));
  }
}
