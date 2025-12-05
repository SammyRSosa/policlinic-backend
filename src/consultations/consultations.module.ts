import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Consultation, ProgrammedConsultation, EmergencyConsultation } from './consultation.entity';
import { Patient } from 'src/patients/patient.entity';
import { Worker } from 'src/workers/worker.entity';
import { Department } from 'src/departments/department.entity';
import { InternalRemission, ExternalRemission, Remission } from 'src/remissions/remission.entity';
import { ConsultationsService } from './consultations.service';
import { ConsultationsController } from './consultations.controller';
import { ClinicHistory } from 'src/clinic-histories/clinic-history.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Consultation,
      ProgrammedConsultation,
      EmergencyConsultation,
      Patient,
      Worker,
      Department,
      InternalRemission,
      ExternalRemission,
      Remission,
      ClinicHistory,
    ]),
  ],
  providers: [ConsultationsService],
  controllers: [ConsultationsController],
  exports: [ConsultationsService],
})
export class ConsultationsModule {}
