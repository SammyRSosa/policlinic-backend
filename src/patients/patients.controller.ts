import { Controller, Post, Body, Get, Req, Delete, Param, Put } from '@nestjs/common';
import { PatientsService } from './patients.service';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/user.entity';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdateWorkerDto } from 'src/workers/dto/update-worker.dto';

@Controller('patients')
export class PatientsController {
  constructor(private readonly service: PatientsService) {}

  @Post()
  // @Roles(UserRole.DOCTOR, UserRole.HEAD_OF_DEPARTMENT)
  create(@Body() dto: CreatePatientDto, @Req() req) {
    return this.service.create(dto, req.user);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Put(':id')
    update(@Param('id') id: string, @Body() dto: UpdateWorkerDto) {
      return this.service.update(id, dto);
    }

  @Delete(':id')
    remove(@Param('id') id: string) {
      return this.service.remove(id);
    }
}
