import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Stock } from '../stocks/stock.entity';

@Entity('stock_items')
export class StockItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  medicationName: string;

  @Column('int', { default: 0 })
  quantity: number;

  @Column('int', { default: 0 })
  minThreshold: number;

  @Column('int', { default: 1000 })
  maxThreshold: number;

  @ManyToOne(() => Stock, (stock) => stock.items, { nullable: false, onDelete: 'CASCADE' })
  stock: Stock;
}
