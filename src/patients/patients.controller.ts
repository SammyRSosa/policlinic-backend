import { Controller, Post, Body, Get, Req } from '@nestjs/common';
import { PatientsService } from './patients.service';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/user.entity';

@Controller('patients')
export class PatientsController {
  constructor(private readonly service: PatientsService) {}

  @Post()
  @Roles(UserRole.DOCTOR, UserRole.HEAD_OF_DEPARTMENT)
  create(@Body() dto: any, @Req() req) {
    return this.service.create(dto, req.user);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }
}
