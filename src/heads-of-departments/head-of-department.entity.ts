import {
  Entity,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  Column,
} from 'typeorm';
import { Worker } from 'src/workers/worker.entity';
import { Department } from 'src/departments/department.entity';

@Entity('heads_of_departments')
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
