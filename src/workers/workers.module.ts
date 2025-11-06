import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Worker } from './worker.entity';
import { Department } from '../departments/department.entity';
import { WorkersService } from './workers.service';
import { WorkersController } from './workers.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Worker, Department])],
  providers: [WorkersService],
  controllers: [WorkersController],
  exports: [WorkersService],
})
export class WorkersModule {}
