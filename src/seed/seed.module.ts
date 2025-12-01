import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';
import { User } from 'src/users/user.entity';
import { Worker } from 'src/workers/worker.entity';
import { Patient } from 'src/patients/patient.entity';
import { Department } from 'src/departments/department.entity';
import { HeadOfDepartment } from 'src/heads-of-departments/head-of-department.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Worker, Patient, Department, HeadOfDepartment])],
  providers: [SeedService],
  controllers: [SeedController],
})
export class SeedModule {}