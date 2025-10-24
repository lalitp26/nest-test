import { OrderResponseDto } from '../../dto/order-response.dto';

export interface IGetOrderUseCase {
  execute(id: string): Promise<OrderResponseDto>;
  findAll(): Promise<OrderResponseDto[]>;
}

export const GET_ORDER_USE_CASE = Symbol('IGetOrderUseCase');
