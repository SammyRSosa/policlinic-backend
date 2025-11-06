import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Worker } from 'src/workers//worker.entity';
import { Department } from 'src/departments/department.entity';

@Entity('worker_departments')
export class WorkerDepartment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Worker, { nullable: false })
  worker: Worker;

  @ManyToOne(() => Department, { nullable: false })
  department: Department;

  @Column({ default: true })
  active: boolean; // true if currently belongs to this department

  @CreateDateColumn()
  joinedAt: Date;

  @UpdateDateColumn({ nullable: true })
  leftAt?: Date; // when worker left department
}
