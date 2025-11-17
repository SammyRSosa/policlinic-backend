import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  TableInheritance,
  ChildEntity,
  OneToOne,
  JoinColumn,
  OneToMany,
  Unique,
} from 'typeorm';
import { Patient } from '../patients/patient.entity';
import { Worker } from '../workers/worker.entity';
import { Department } from '../departments/department.entity';
import { InternalRemission } from '../remissions/remission.entity';
import { ExternalRemission } from '../remissions/remission.entity';
import { ClinicHistory } from '../clinic-histories/clinic-history.entity';
import { ConsultationPrescription } from '../consultations-prescriptions/consultations-prescription.entity';

export enum ConsultationStatus {
  PENDING = 'pending',
  CANCELED = 'canceled',
  CLOSED = 'closed',
}

@Entity('consultations')
@Unique(["mainDoctor","createdAt"])
@TableInheritance({ column: { type: 'varchar', name: 'type' } })
export abstract class Consultation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Worker, { nullable: false })
  mainDoctor: Worker;

  @ManyToOne(() => Worker, { nullable: false })
  Doctor: Worker;

  @ManyToOne(() => Department, { nullable: false })
  department: Department;

  @Column({ type: 'enum', enum: ConsultationStatus, default: ConsultationStatus.PENDING })
  status: ConsultationStatus;

  @Column({ nullable: true })
  diagnosis?: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => ClinicHistory, (history) => history.consultations, { nullable: true })
  clinicHistory?: ClinicHistory;


  @OneToMany(() => ConsultationPrescription, (prescription) => prescription.consultation)
  prescriptions: ConsultationPrescription[];

}

@ChildEntity('programmed')
export class ProgrammedConsultation extends Consultation {
  @Column({ type: 'timestamp', nullable: false })
  scheduledAt: Date;


  @OneToOne(() => InternalRemission, { nullable: true })
  @JoinColumn()
  internalRemission?: InternalRemission;

  @OneToOne(() => ExternalRemission, { nullable: true })
  @JoinColumn()
  externalRemission?: ExternalRemission;


}

@ChildEntity('emergency')
export class EmergencyConsultation extends Consultation {
  @ManyToOne(() => Patient, { nullable: false })
  patient: Patient;

}
