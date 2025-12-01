import { Controller, Get, Post, Body, Param, NotFoundException } from '@nestjs/common'; // ✅ Agregar NotFoundException si lo usas directamente
import { MedicationsService } from './medications.service';
import { CreateMedicationDto } from './dto/create-medication.dto';

@Controller('medications')
export class MedicationsController {
  constructor(private readonly medicationsService: MedicationsService) {}

  @Post()
  create(@Body() createMedicationDto: CreateMedicationDto) {
    return this.medicationsService.create(createMedicationDto);
  }

  @Get()
  findAll() {
    return this.medicationsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.medicationsService.findOneOrFail(id);
  }
}