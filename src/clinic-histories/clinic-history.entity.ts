import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  OneToMany,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Patient } from '../patients/patient.entity';
import { Consultation } from '../consultations/consultation.entity';
import { Exclude } from 'class-transformer';

@Entity('clinic_histories')
export class ClinicHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Patient, (patient) => patient.clinicHistory, {eager: true , nullable: false, onDelete: 'CASCADE' })
  @JoinColumn()
  patient: Patient;

  @OneToMany(() => Consultation, (consultation) => consultation.clinicHistory, { cascade: true })
  consultations: Consultation[];

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @CreateDateColumn()
  createdAt: Date;
}
