import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ConsultationPrescription } from '../consultations-prescriptions/consultations-prescription.entity';
import { Stock } from '../stocks/stock.entity';

@Entity('medications')
export class Medication {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  code?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ nullable: true })
  unit?: string; // e.g., tablet, ml

  @OneToMany(() => ConsultationPrescription, (prescription) => prescription.medication)
  prescriptions: ConsultationPrescription[];

  @OneToMany(() => Stock, (stock) => stock.medication)
  stocks: Stock[];
}
