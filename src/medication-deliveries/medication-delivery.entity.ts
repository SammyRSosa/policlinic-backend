import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { Medication } from 'src/medications/medication.entity';
import { Department } from 'src/departments/department.entity';
import { Worker } from 'src/workers/worker.entity';

export enum DeliveryStatus {
  PENDING = 'pending',
  DELIVERED = 'delivered',
  CANCELED = 'canceled',
}

@Entity('medication_deliveries')
export class MedicationDelivery {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Medication, { nullable: false })
  medication: Medication;

  @ManyToOne(() => Department, { nullable: false })
  department: Department;

  @ManyToOne(() => Worker, { nullable: true })
  requestedBy?: Worker; // Head of department who requested

  @Column({ type: 'int', default: 0 })
  quantity: number;

  @Column({ type: 'enum', enum: DeliveryStatus, default: DeliveryStatus.PENDING })
  status: DeliveryStatus;

  @CreateDateColumn()
  createdAt: Date;
}
