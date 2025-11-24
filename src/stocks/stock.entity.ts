import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  Unique,
} from 'typeorm';
import { Department } from '../departments/department.entity';
import { Medication } from '../medications/medication.entity';
import { StockItem } from '../stock-items/stock-item.entity';

@Entity('stocks')
@Unique(['medication', 'department'])
export class Stock {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Medication, (medication) => medication.stocks, {
    nullable: true,
  })
  medication: Medication;

  @ManyToOne(() => Department, (department) => department.stocks, {
    nullable: true,
  })
  department?: Department; // null means main storage

  @Column({ type: 'int', default: 0 })
  quantity: number;

  @Column({ type: 'int', default: 0 })
  minQuantity: number;

  @Column({ type: 'int', default: 1000 })
  maxQuantity: number;

  @OneToMany(() => StockItem, (item) => item.stock)
  items: StockItem[];
}
