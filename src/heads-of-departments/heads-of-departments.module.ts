import { Module } from '@nestjs/common';
import { HeadsOfDepartmentsService } from './heads-of-departments.service';
import { HeadsOfDepartmentsController } from './heads-of-departments.controller';

@Module({
  providers: [HeadsOfDepartmentsService],
  controllers: [HeadsOfDepartmentsController]
})
export class HeadsOfDepartmentsModule {}
