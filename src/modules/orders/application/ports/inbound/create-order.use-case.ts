import { CreateOrderDto } from '../../dto/create-order.dto';
import { OrderResponseDto } from '../../dto/order-response.dto';

export interface ICreateOrderUseCase {
  execute(dto: CreateOrderDto): Promise<OrderResponseDto>;
}

export const CREATE_ORDER_USE_CASE = Symbol('ICreateOrderUseCase');
