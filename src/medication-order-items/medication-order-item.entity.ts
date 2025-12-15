import { Entity, PrimaryGeneratedColumn, Column, ManyToOne ,Unique, } from 'typeorm';
import { MedicationOrder } from 'src/medication-orders/medication-order.entity';
import { Medication } from 'src/medications/medication.entity';

@Entity('medication_order_items')
@Unique(['medicationOrder', 'medication'])
export class MedicationOrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => MedicationOrder, (order) => order.items, {
    nullable: false,
    onDelete: 'CASCADE',
    eager: false,
  })
  medicationOrder!: MedicationOrder;

  @ManyToOne(() => Medication, {
    nullable: false,
    eager: false,
  })
  medication!: Medication;

  @Column('int', { default: 0 })
  quantity: number = 0;
}