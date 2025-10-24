import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IOrderRepository } from '../../../../application/ports/outbound/order-repository.port';
import { Order } from '../../../../domain/entities/order.entity';
import { OrderTypeormEntity } from '../entities/order.typeorm-entity';
import { OrderTypeormMapper } from '../mappers/order-typeorm.mapper';

@Injectable()
export class OrderTypeormRepository implements IOrderRepository {
  constructor(
    @InjectRepository(OrderTypeormEntity)
    private readonly repository: Repository<OrderTypeormEntity>,
    private readonly mapper: OrderTypeormMapper,
  ) {}

  async save(order: Order): Promise<Order> {
    const entity = this.mapper.toPersistence(order);
    const savedEntity = await this.repository.save(entity);
    return this.mapper.toDomain(savedEntity);
  }

  async findById(id: string): Promise<Order | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? this.mapper.toDomain(entity) : null;
  }

  async findAll(): Promise<Order[]> {
    const entities = await this.repository.find();
    return this.mapper.toDomainList(entities);
  }

  async update(id: string, order: Order): Promise<Order> {
    const entity = this.mapper.toPersistence(order);
    await this.repository.update(id, entity);
    const updatedEntity = await this.repository.findOne({ where: { id } });
    return this.mapper.toDomain(updatedEntity!);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
