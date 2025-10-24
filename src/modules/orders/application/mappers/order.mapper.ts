import { Injectable } from '@nestjs/common';
import { Order } from '../../domain/entities/order.entity';
import { OrderResponseDto, OrderItemResponseDto } from '../dto/order-response.dto';

@Injectable()
export class OrderMapper {
  toDto(order: Order): OrderResponseDto {
    return {
      id: order.id,
      customerId: order.customerId,
      items: order.items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.quantity * item.price,
      })),
      total: order.calculateTotal(),
      status: order.status,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }

  toDtoList(orders: Order[]): OrderResponseDto[] {
    return orders.map(order => this.toDto(order));
  }
}
