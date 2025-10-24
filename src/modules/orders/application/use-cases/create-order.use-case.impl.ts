import { Inject, Injectable } from '@nestjs/common';
import { ICreateOrderUseCase } from '../ports/inbound/create-order.use-case';
import { IOrderRepository, ORDER_REPOSITORY } from '../ports/outbound/order-repository.port';
import { CreateOrderDto } from '../dto/create-order.dto';
import { OrderResponseDto } from '../dto/order-response.dto';
import { OrderMapper } from '../mappers/order.mapper';
import { Order } from '../../domain/entities/order.entity';
import { OrderItem } from '../../domain/value-objects/order-item.vo';

@Injectable()
export class CreateOrderUseCaseImpl implements ICreateOrderUseCase {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: IOrderRepository,
    private readonly orderMapper: OrderMapper,
  ) {}

  async execute(dto: CreateOrderDto): Promise<OrderResponseDto> {
    // Create order items value objects
    const items = dto.items.map(
      item => new OrderItem(item.productId, item.quantity, item.price),
    );

    // Create order entity
    const order = Order.create(dto.customerId, items);

    // Validate business rules
    order.validate();

    // Persist order
    const savedOrder = await this.orderRepository.save(order);

    // Map to DTO and return
    return this.orderMapper.toDto(savedOrder);
  }
}
