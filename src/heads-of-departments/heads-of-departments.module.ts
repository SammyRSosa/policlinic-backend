import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HeadsOfDepartmentsService } from './heads-of-departments.service';
import { HeadsOfDepartmentsController } from './heads-of-departments.controller';
import { HeadOfDepartment } from './head-of-department.entity';

@Module({
  imports: [TypeOrmModule.forFeature([HeadOfDepartment])],
  providers: [HeadsOfDepartmentsService],
  controllers: [HeadsOfDepartmentsController],
  exports: [HeadsOfDepartmentsService],
})
export class HeadsOfDepartmentsModule {}
