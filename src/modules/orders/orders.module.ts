import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Infrastructure - Inbound Adapters
import { OrdersController } from './infrastructure/adapters/inbound/http/orders.controller';

// Infrastructure - Outbound Adapters
import { OrderTypeormEntity } from './infrastructure/persistence/typeorm/entities/order.typeorm-entity';
import { OrderTypeormRepository } from './infrastructure/persistence/typeorm/repositories/order-typeorm.repository';
import { OrderTypeormMapper } from './infrastructure/persistence/typeorm/mappers/order-typeorm.mapper';
import { EmailNotificationAdapter } from './infrastructure/adapters/outbound/notification/email-notification.adapter';

// Application
import { CreateOrderUseCaseImpl } from './application/use-cases/create-order.use-case.impl';
import { GetOrderUseCaseImpl } from './application/use-cases/get-order.use-case.impl';
import { OrderMapper } from './application/mappers/order.mapper';
import { CREATE_ORDER_USE_CASE } from './application/ports/inbound/create-order.use-case';
import { GET_ORDER_USE_CASE } from './application/ports/inbound/get-order.use-case';
import { ORDER_REPOSITORY } from './application/ports/outbound/order-repository.port';
import { NOTIFICATION_SERVICE } from './application/ports/outbound/notification.port';

// Domain
import { OrderValidationService } from './domain/services/order-validation.service';

@Module({
  imports: [TypeOrmModule.forFeature([OrderTypeormEntity])],
  controllers: [OrdersController],
  providers: [
    // Application Layer
    OrderMapper,
    {
      provide: CREATE_ORDER_USE_CASE,
      useClass: CreateOrderUseCaseImpl,
    },
    {
      provide: GET_ORDER_USE_CASE,
      useClass: GetOrderUseCaseImpl,
    },

    // Infrastructure Layer - Repositories
    OrderTypeormMapper,
    {
      provide: ORDER_REPOSITORY,
      useClass: OrderTypeormRepository,
    },

    // Infrastructure Layer - External Services
    {
      provide: NOTIFICATION_SERVICE,
      useClass: EmailNotificationAdapter,
    },

    // Domain Services
    OrderValidationService,
  ],
  exports: [CREATE_ORDER_USE_CASE, GET_ORDER_USE_CASE],
})
export class OrdersModule {}
