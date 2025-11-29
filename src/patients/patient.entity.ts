import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { InternalRemission, ExternalRemission } from '../remissions/remission.entity';
import { EmergencyConsultation } from '../consultations/consultation.entity';
import { ClinicHistory } from '../clinic-histories/clinic-history.entity';
import { User } from '../users/user.entity';

@Entity('patients')
export class Patient {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  idNumber: string; // used as username for login

  @Column({ nullable: true })
  email?: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ type: 'date', nullable: true })
  dateOfBirth?: Date;

  @OneToMany(() => InternalRemission, (remission) => remission.patient)
  internalRemissions: InternalRemission[];

  @OneToMany(() => ExternalRemission, (remission) => remission.patient)
  externalRemissions: ExternalRemission[];

  @OneToMany(() => EmergencyConsultation, (consultation) => consultation.patient)
  emergencyConsultations: EmergencyConsultation[];

  @OneToOne(() => ClinicHistory, (history) => history.patient)
  clinicHistory: ClinicHistory;

  // Link to user account
  @OneToOne(() => User, (user) => user.patient)
  user?: User;
}
