import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';
import { Patient } from 'src/patients/patient.entity';
import { Consultation } from 'src/consultations/consultation.entity';

@Entity('clinic_histories')
export class ClinicHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Patient, { nullable: false })
  patient: Patient;

  @OneToMany(() => Consultation, (consultation) => consultation.clinicHistory)
  consultations: Consultation[];

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @CreateDateColumn()
  createdAt: Date;
}
