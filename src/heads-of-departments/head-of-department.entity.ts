import {
  Entity,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  Column,
  Unique,
} from 'typeorm';
import { Worker } from '../workers/worker.entity';
import { Department } from '../departments/department.entity';

@Entity('heads_of_departments')
@Unique(['worker', 'assignedAt'])
export class HeadOfDepartment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Worker, { eager: true, nullable: false })
  @JoinColumn()
  worker: Worker;

  @OneToOne(() => Department, (department) => department.headOfDepartment)
  department: Department;

  @Column({ type: 'date', default: () => 'CURRENT_DATE' })
  assignedAt: Date;

  @Column({ type: 'date', nullable: true })
  endedAt: Date;
}
