import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IUserRepository } from '../../../../application/ports/outbound/user-repository.port';
import { User } from '../../../../domain/entities/user.entity';
import { UserTypeormEntity } from '../entities/user.typeorm-entity';
import { UserTypeormMapper } from '../mappers/user-typeorm.mapper';

@Injectable()
export class UserTypeormRepository implements IUserRepository {
  constructor(
    @InjectRepository(UserTypeormEntity)
    private readonly repository: Repository<UserTypeormEntity>,
    private readonly mapper: UserTypeormMapper,
  ) {}

  async save(user: User): Promise<User> {
    const entity = this.mapper.toPersistence(user);
    const savedEntity = await this.repository.save(entity);
    return this.mapper.toDomain(savedEntity);
  }

  async findById(id: string): Promise<User | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? this.mapper.toDomain(entity) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const entity = await this.repository.findOne({ where: { email } });
    return entity ? this.mapper.toDomain(entity) : null;
  }

  async findAll(): Promise<User[]> {
    const entities = await this.repository.find();
    return this.mapper.toDomainList(entities);
  }

  async update(user: User): Promise<User | null> {
    const entity = this.mapper.toPersistence(user);
    await this.repository.update(user.id, entity);
    const updatedEntity = await this.repository.findOne({ where: { id: user.id } });
    return updatedEntity ? this.mapper.toDomain(updatedEntity) : null;
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
