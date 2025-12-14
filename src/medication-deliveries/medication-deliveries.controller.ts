// medication-deliveries.controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { MedicationDeliveriesService } from './medication-deliveries.service';
import { DeliveryStatus } from './medication-delivery.entity';
import { CreateMedicationDeliveryDto } from './dto/create-medication-delivery.dto';
import { UpdateMedicationDeliveryStatusDto } from './dto/update-medication-delivery-status.dto';

@Controller('medication-deliveries')
export class MedicationDeliveriesController {
  constructor(private readonly service: MedicationDeliveriesService) {}

  @Post()
  create(
    @Body()
    body: CreateMedicationDeliveryDto) {
    return this.service.create(body);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get('department/:departmentId')
  findByDepartment(@Param('departmentId') departmentId: string) {
    return this.service.findByDepartment(departmentId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() body: UpdateMedicationDeliveryStatusDto,
) {
    return this.service.updateStatus(id, body.status, body.comment);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }
}