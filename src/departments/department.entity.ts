import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Worker } from '../workers/worker.entity';
import { Consultation, ProgrammedConsultation } from '../consultations/consultation.entity';
import { ExternalRemission, InternalRemission, Remission } from '../remissions/remission.entity';
import { HeadOfDepartment } from '../heads-of-departments/head-of-department.entity';
import { WorkerDepartment } from '../workers-department/worker-department.entity';
import { StockItem } from '../stock-items/stock-item.entity';


@Entity('departments')
export class Department {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @OneToOne(() => HeadOfDepartment, (head) => head.department, {
    cascade: true,
    eager: true,
  })
  @JoinColumn()
  headOfDepartment: HeadOfDepartment | null;
  
  @OneToMany(() => StockItem, (stockItem) => stockItem.department)
  stockItems: StockItem[];

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
