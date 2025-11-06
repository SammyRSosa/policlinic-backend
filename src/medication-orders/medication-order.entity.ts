import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Department } from 'src/departments/department.entity';
import { HeadOfDepartment } from 'src/heads-of-departments/head-of-department.entity';
import { MedicationOrderItem } from 'src/medication-order-items/medication-order-item.entity';

export enum MedicationOrderStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  DENIED = 'denied',
}

@Entity('medication_orders')
export class MedicationOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Department, { nullable: false })
  department: Department;

  @ManyToOne(() => HeadOfDepartment, { nullable: false })
  head: HeadOfDepartment;

  @Column({ type: 'enum', enum: MedicationOrderStatus, default: MedicationOrderStatus.PENDING })
  status: MedicationOrderStatus;

  @CreateDateColumn()
  requestedAt: Date;

  @UpdateDateColumn({ nullable: true })
  respondedAt: Date;

  @OneToMany(() => MedicationOrderItem, (item) => item.medicationOrder, { cascade: true, eager: true })
  items: MedicationOrderItem[];
}
