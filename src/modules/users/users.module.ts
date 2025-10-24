import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Infrastructure - Inbound Adapters
import { UsersController } from './infrastructure/adapters/inbound/http/users.controller';

// Infrastructure - Outbound Adapters
import { UserTypeormEntity } from './infrastructure/persistence/typeorm/entities/user.typeorm-entity';
import { UserTypeormRepository } from './infrastructure/persistence/typeorm/repositories/user-typeorm.repository';
import { UserTypeormMapper } from './infrastructure/persistence/typeorm/mappers/user-typeorm.mapper';
import { BcryptPasswordHasherAdapter } from './infrastructure/adapters/outbound/password/bcrypt-password-hasher.adapter';

// Application
import { CreateUserUseCaseImpl } from './application/use-cases/create-user.use-case.impl';
import { GetUserUseCaseImpl } from './application/use-cases/get-user.use-case.impl';
import { UserMapper } from './application/mappers/user.mapper';
import { CREATE_USER_USE_CASE } from './application/ports/inbound/create-user.use-case';
import { GET_USER_USE_CASE } from './application/ports/inbound/get-user.use-case';
import { USER_REPOSITORY } from './application/ports/outbound/user-repository.port';
import { PASSWORD_HASHER } from './application/ports/outbound/password-hasher.port';

// Domain
import { UserValidationService } from './domain/services/user-validation.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserTypeormEntity])],
  controllers: [UsersController],
  providers: [
    // Application Layer
    UserMapper,
    {
      provide: CREATE_USER_USE_CASE,
      useClass: CreateUserUseCaseImpl,
    },
    {
      provide: GET_USER_USE_CASE,
      useClass: GetUserUseCaseImpl,
    },

    // Infrastructure Layer - Repositories
    UserTypeormMapper,
    {
      provide: USER_REPOSITORY,
      useClass: UserTypeormRepository,
    },

    // Infrastructure Layer - External Services
    {
      provide: PASSWORD_HASHER,
      useClass: BcryptPasswordHasherAdapter,
    },

    // Domain Services
    UserValidationService,
  ],
  exports: [CREATE_USER_USE_CASE, GET_USER_USE_CASE],
})
export class UsersModule {}
