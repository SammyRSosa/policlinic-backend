import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  Unique,
} from 'typeorm';
import { Consultation } from 'src/consultations/consultation.entity';
import { Medication } from 'src/medications/medication.entity'; // We'll create a Medication entity later

@Entity('consultation_prescriptions')
@Unique(["consultation","medication"])
export class ConsultationPrescription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Consultation, (consultation) => consultation.prescriptions, { nullable: false })
  consultation: Consultation;

  @ManyToOne(() => Medication, { nullable: false })
  medication: Medication;

  @Column({ type: 'int', default: 1 })
  quantity: number;

  @Column({ type: 'text', nullable: true })
  instructions?: string; // e.g., take twice a day
}
