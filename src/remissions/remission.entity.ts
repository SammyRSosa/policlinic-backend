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
  Unique,
} from 'typeorm';
import { Patient } from '../patients/patient.entity';
import { Department } from '../departments/department.entity';
import { Consultation } from '../consultations/consultation.entity';
import { MedicalPost } from '../medical-posts/medical-post.entity';

@Entity('remissions')
@Unique(['patient', 'toDepartment', 'createdAt'])
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

  @CreateDateColumn()
  date: Date;

  @OneToOne(() => Consultation, { nullable: true, cascade: true,onDelete:'CASCADE' })
  @JoinColumn()
  consultation?: Consultation;
}

@ChildEntity('internal')
export class InternalRemission extends Remission {
  @ManyToOne(() => Department, { nullable: true })
  fromDepartment?: Department;
}

@ChildEntity('external')
export class ExternalRemission extends Remission {
  @ManyToOne(() => MedicalPost, { nullable: true })
  @JoinColumn({ name: 'medical_post_id' })
  medicalPost?: MedicalPost;
}
