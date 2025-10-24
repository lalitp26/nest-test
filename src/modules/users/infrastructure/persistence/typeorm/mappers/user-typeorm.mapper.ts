import { Injectable } from '@nestjs/common';
import { User } from '../../../../domain/entities/user.entity';
import { Email } from '../../../../domain/value-objects/email.vo';
import { UserTypeormEntity } from '../entities/user.typeorm-entity';

@Injectable()
export class UserTypeormMapper {
  toDomain(entity: UserTypeormEntity): User {
    const email = new Email(entity.email);

    return User.reconstitute(
      entity.id,
      entity.firstName,
      entity.lastName,
      email,
      entity.password,
      entity.isActive,
      entity.createdAt,
      entity.updatedAt,
    );
  }

  toPersistence(domain: User): UserTypeormEntity {
    const entity = new UserTypeormEntity();
    entity.id = domain.id;
    entity.firstName = domain.firstName;
    entity.lastName = domain.lastName;
    entity.email = domain.email.value;
    entity.password = domain.password;
    entity.isActive = domain.isActive;
    entity.createdAt = domain.createdAt;
    entity.updatedAt = domain.updatedAt;
    return entity;
  }

  toDomainList(entities: UserTypeormEntity[]): User[] {
    return entities.map(entity => this.toDomain(entity));
  }
}
