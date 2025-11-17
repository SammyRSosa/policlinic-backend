import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Unique } from 'typeorm';
import { MedicationDelivery } from 'src/medication-deliveries/medication-delivery.entity';
import { Medication } from 'src/medications/medication.entity';

@Entity('medication_delivery_items')
@Unique([ 'medicationDelivery', 'medication'])
export class MedicationDeliveryItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(
    () => MedicationDelivery,
    (delivery) => delivery.items,
    { nullable: false, onDelete: 'CASCADE' },
  )
  medicationDelivery: MedicationDelivery;

  @ManyToOne(() => Medication, { nullable: false })
  medication: Medication;

  @Column('int')
  quantity: number;
}
