import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Remission, InternalRemission, ExternalRemission } from './remission.entity';
import { Patient } from 'src/patients/patient.entity';
import { Department } from 'src/departments/department.entity';
import { Consultation } from 'src/consultations/consultation.entity';
import { RemissionsService } from './remissions.service';
import { RemissionsController } from './remissions.controller';
import { MedicalPost } from 'src/medical-posts/medical-post.entity';
import { Worker } from 'src/workers/worker.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Remission,
      InternalRemission,
      ExternalRemission,
      Patient,
      Department,
      Consultation,
      MedicalPost,
      Worker,
    ]),
  ],
  providers: [RemissionsService],
  controllers: [RemissionsController],
  exports: [RemissionsService],
})
export class RemissionsModule {}
