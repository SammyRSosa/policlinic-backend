import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { RemissionsService } from './remissions.service';

@Controller('remissions')
export class RemissionsController {
  constructor(private readonly remissionsService: RemissionsService) {}

  @Post('internal')
  createInternal(@Body() body: { patientId: string; fromDepartmentId: string; toDepartmentId: string }) {
    return this.remissionsService.createInternal(body.patientId, body.fromDepartmentId, body.toDepartmentId);
  }

  @Post('external')
  createExternal(@Body() body: { patientId: string; toDepartmentId: string }) {
    return this.remissionsService.createExternal(body.patientId, body.toDepartmentId);
  }

  @Get()
  findAll() {
    return this.remissionsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.remissionsService.findOne(id);
  }
}
