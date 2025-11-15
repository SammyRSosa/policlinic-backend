import {
  Entity,
  PrimaryGeneratedColumn,
  PrimaryColumn,
  Column,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { Department } from 'src/departments/department.entity';
import { Consultation } from 'src/consultations/consultation.entity';
import { WorkerDepartment } from 'src/workers-department/worker-department.entity';
import { User } from 'src/users/user.entity';

export enum WorkerRole {
  ADMIN = 'admin',
  HEAD_OF_DEPARTMENT = 'head_of_department',
  DOCTOR = 'doctor',
  NURSE = 'nurse',
  STAFF = 'staff',
}

@Entity('workers')
export class Worker {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @PrimaryColumn()
  code: string; // unique worker code for login if assigned

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ nullable: true })
  email?: string;

  @Column({ type: 'enum', enum: WorkerRole })
  role: WorkerRole;

  @Column({ default: true })
  active: boolean;

  @ManyToOne(() => Department, (department) => department.workers, { nullable: true })
  department?: Department;

  @OneToMany(() => Consultation, (consultation) => consultation.mainDoctor)
  consultations: Consultation[];

  @OneToOne(() => Department, (department) => department.headOfDepartment)
  headOfDepartment?: Department;

  @OneToMany(() => WorkerDepartment, (wd) => wd.worker)
  departmentHistory: WorkerDepartment[];

  // Link to user account (for authentication)
  @OneToOne(() => User, (user) => user.worker)
  user?: User;
}
