import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  OneToOne,
} from 'typeorm';
import { Patient } from '../patients/patient.entity';
import { Consultation } from '../consultations/consultation.entity';

@Entity('clinic_histories')
export class ClinicHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Patient, { nullable: false })
  patient: Patient;

  @OneToMany(() => Consultation, (consultation) => consultation.clinicHistory)
  consultations: Consultation[];

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @CreateDateColumn()
  createdAt: Date;
}
