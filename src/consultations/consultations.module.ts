import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Consultation, ProgrammedConsultation, EmergencyConsultation } from './consultation.entity';
import { Patient } from 'src/patients/patient.entity';
import { Worker } from 'src/workers/worker.entity';
import { Department } from 'src/departments/department.entity';
import { InternalRemission, ExternalRemission } from 'src/remissions/remission.entity';
import { ConsultationsService } from './consultations.service';
import { ConsultationsController } from './consultations.controller';

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
    ]),
  ],
  providers: [ConsultationsService],
  controllers: [ConsultationsController],
  exports: [ConsultationsService],
})
export class ConsultationsModule {}
