import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { MedicationOrder } from 'src/medication-orders/medication-order.entity';
import { StockItem } from 'src/stock-items/stock-item.entity';

@Entity('medication_order_items')
export class MedicationOrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => MedicationOrder, (order) => order.items, { nullable: false })
  medicationOrder: MedicationOrder;

  @ManyToOne(() => StockItem, { nullable: false })
  stockItem: StockItem;

  @Column('int')
  quantity: number;
}
