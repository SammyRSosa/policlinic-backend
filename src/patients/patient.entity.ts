import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { InternalRemission, ExternalRemission } from 'src/remissions/remission.entity';
import { EmergencyConsultation } from 'src/consultations/consultation.entity';
import { ClinicHistory } from 'src/clinic-histories/clinic-history.entity';
import { User } from 'src/users/user.entity';

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
  clinicHistories: ClinicHistory[];

  // Link to user account
  @OneToOne(() => User, (user) => user.patient)
  user?: User;
}
