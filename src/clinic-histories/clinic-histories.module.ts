import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClinicHistory } from './clinic-history.entity';
import { Patient } from 'src/patients/patient.entity';
import { User } from 'src/users/user.entity';
import { ClinicHistoryService } from './clinic-histories.service';
import { ClinicHistoryController } from './clinic-histories.controller';
import { Consultation } from 'src/consultations/consultation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ClinicHistory, Patient, User, Consultation])],
  providers: [ClinicHistoryService],
  controllers: [ClinicHistoryController],
  exports: [ClinicHistoryService],
})
export class ClinicHistoryModule {}
