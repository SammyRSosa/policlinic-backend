import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  TableInheritance,
  ChildEntity,
} from 'typeorm';
import { Patient } from 'src/patients/patient.entity';
import { Department } from 'src/departments/department.entity';
import { Consultation } from 'src/consultations/consultation.entity';

@Entity('remissions')
@TableInheritance({ column: { type: 'varchar', name: 'type' } })
export abstract class Remission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Patient, { nullable: false })
  patient: Patient;

  @ManyToOne(() => Department, { nullable: false })
  toDepartment: Department;

  @CreateDateColumn()
  createdAt: Date;

  @OneToOne(() => Consultation, { nullable: true, cascade: true })
  @JoinColumn()
  consultation?: Consultation;
}

@ChildEntity('internal')
export class InternalRemission extends Remission {
  @ManyToOne(() => Department, { nullable: false })
  fromDepartment: Department;
}

@ChildEntity('external')
export class ExternalRemission extends Remission {}
