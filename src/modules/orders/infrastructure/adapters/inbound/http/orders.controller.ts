import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Inject,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ICreateOrderUseCase,
  CREATE_ORDER_USE_CASE,
} from '../../../../application/ports/inbound/create-order.use-case';
import {
  IGetOrderUseCase,
  GET_ORDER_USE_CASE,
} from '../../../../application/ports/inbound/get-order.use-case';
import { CreateOrderDto } from '../../../../application/dto/create-order.dto';
import { OrderResponseDto } from '../../../../application/dto/order-response.dto';

@Controller('orders')
export class OrdersController {
  constructor(
    @Inject(CREATE_ORDER_USE_CASE)
    private readonly createOrderUseCase: ICreateOrderUseCase,
    @Inject(GET_ORDER_USE_CASE)
    private readonly getOrderUseCase: IGetOrderUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createOrderDto: CreateOrderDto): Promise<OrderResponseDto> {
    return this.createOrderUseCase.execute(createOrderDto);
  }

  @Get()
  async findAll(): Promise<OrderResponseDto[]> {
    return this.getOrderUseCase.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<OrderResponseDto> {
    return this.getOrderUseCase.execute(id);
  }
}
