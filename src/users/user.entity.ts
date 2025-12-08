import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Worker } from '../workers/worker.entity';
import { Patient } from '../patients/patient.entity';

export enum UserRole {
  ADMIN = 'admin',
  HEAD_OF_DEPARTMENT = 'head_of_department',
  DOCTOR = 'doctor',
  PATIENT = 'patient',
  NURSE = 'nurse',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  username: string; // worker.code or patient.idNumber

  @Column()
  password: string;

  @Column({ type: 'enum', enum: UserRole })
  role: UserRole;

  @OneToOne(() => Worker, (worker) => worker.user, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  worker?: Worker;

  @OneToOne(() => Patient, (patient) => patient.user, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  patient?: Patient;
}
