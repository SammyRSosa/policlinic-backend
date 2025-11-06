import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Worker } from 'src/workers/worker.entity';
import { Stock } from 'src/stocks/stock.entity';
import { Consultation, ProgrammedConsultation } from 'src/consultations/consultation.entity';
import { ExternalRemission, InternalRemission, Remission } from 'src/remissions/remission.entity';
import { HeadOfDepartment } from 'src/heads-of-departments/head-of-department.entity';
import { WorkerDepartment } from 'src/workers-department/worker-department.entity';

@Entity('departments')
export class Department {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @OneToOne(() => HeadOfDepartment, (head) => head.department, {
    cascade: true,
    eager: true,
  })
  @JoinColumn()
  headOfDepartment: HeadOfDepartment;

  @OneToMany(() => Stock, (stock) => stock.department)
  stocks: Stock[];

  @OneToMany(() => Worker, (worker) => worker.department)
  workers: Worker[];

  @OneToMany(() => Consultation, (consultation) => consultation.department)
  consultations: Consultation[];

  @OneToMany(() => ProgrammedConsultation, (consultation) => consultation.department)

  programmedConsultations: ProgrammedConsultation[];

  @OneToMany(() => Remission, (remission) => remission.toDepartment)
  remissionsReceived: Remission[];

  @OneToMany(() => InternalRemission, (remission) => remission.fromDepartment)
  remissionsSent: Remission[];

  @OneToMany(() => WorkerDepartment, (wd) => wd.department)
  workerHistory: WorkerDepartment[];

}
