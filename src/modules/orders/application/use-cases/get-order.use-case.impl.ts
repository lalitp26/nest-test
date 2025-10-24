import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IGetOrderUseCase } from '../ports/inbound/get-order.use-case';
import { IOrderRepository, ORDER_REPOSITORY } from '../ports/outbound/order-repository.port';
import { OrderResponseDto } from '../dto/order-response.dto';
import { OrderMapper } from '../mappers/order.mapper';

@Injectable()
export class GetOrderUseCaseImpl implements IGetOrderUseCase {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: IOrderRepository,
    private readonly orderMapper: OrderMapper,
  ) {}

  async execute(id: string): Promise<OrderResponseDto> {
    const order = await this.orderRepository.findById(id);
    
    if (!order) {
      throw new NotFoundException(`Order with id ${id} not found`);
    }

    return this.orderMapper.toDto(order);
  }

  async findAll(): Promise<OrderResponseDto[]> {
    const orders = await this.orderRepository.findAll();
    return this.orderMapper.toDtoList(orders);
  }
}
