import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  Unique,
} from 'typeorm';
import { Product } from '../../products/entities/product.entity';

@Entity('variants')
@Unique(['product', 'combinationKey'])
export class Variant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  combinationKey: string;

  @Column({ type: 'jsonb' })
  attributes: Record<string, string>;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'int', default: 0 })
  stock: number;

  @Column({ nullable: true })
  sku: string;

  @ManyToOne(() => Product, (product) => product.variants, {
    onDelete: 'CASCADE',
  })
  product: Product;

  @CreateDateColumn()
  createdAt: Date;
}
