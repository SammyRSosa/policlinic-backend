import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  Unique,
} from 'typeorm';
import { Department } from '../departments/department.entity';
import { Worker } from '../workers/worker.entity';
import { MedicationDeliveryItem } from '../medication-deliveries-items/medication-delivery-item.entity';

export enum DeliveryStatus {
  PENDING = 'pending',
  DELIVERED = 'delivered',
  CANCELED = 'canceled',
}

@Entity('medication_deliveries')
@Unique([ 'department', 'createdAt'])
export class MedicationDelivery {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Department, { nullable: false })
  department: Department;

  @ManyToOne(() => Worker, { nullable: true })
  requestedBy?: Worker;

  /** AHORA LA RELACIÓN ES ONE TO MANY CON ITEMS */
  @OneToMany(
    () => MedicationDeliveryItem,
    (item) => item.medicationDelivery,
    { cascade: true, eager: true }
  )
  items: MedicationDeliveryItem[];

  @Column({
    type: 'enum',
    enum: DeliveryStatus,
    default: DeliveryStatus.PENDING,
  })
  status: DeliveryStatus;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ 
    type: 'text', 
    nullable: true 
  })
  comment: string
}
