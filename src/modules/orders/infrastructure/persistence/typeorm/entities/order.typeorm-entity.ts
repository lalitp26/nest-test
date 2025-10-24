import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('orders')
export class OrderTypeormEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column()
  customerId: string;

  @Column('jsonb')
  items: {
    productId: string;
    quantity: number;
    price: number;
  }[];

  @Column({
    type: 'enum',
    enum: ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'],
    default: 'PENDING',
  })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
