import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { StockItemsService } from './stocks-items.service';

@Controller('stock-items')
export class StockItemsController {
  constructor(private readonly stockItemsService: StockItemsService) {}

  // ✅ CAMBIAR: Recibir medicationId en el body
  @Post('create/:departmentId')
  create(
    @Param('departmentId') departmentId: string,
    @Body() body: { medicationId: string; quantity?: number }, // ✅ Cambiar a medicationId
  ) {
    return this.stockItemsService.create(departmentId, body.medicationId, body.quantity);
  }

  @Get()
  findAll() {
    return this.stockItemsService.findAll();
  }

  @Get('department/:departmentId')
  findByDepartment(@Param('departmentId') departmentId: string) {
    return this.stockItemsService.findByDepartment(departmentId);
  }

  // ✅ NUEVO: Endpoint para buscar por medicamento
  @Get('medication/:medicationId')
  findByMedication(@Param('medicationId') medicationId: string) {
    return this.stockItemsService.findByMedication(medicationId);
  }

  // ✅ NUEVO: Endpoint para buscar por departamento y medicamento
  @Get('department/:departmentId/medication/:medicationId')
  findByDepartmentAndMedication(
    @Param('departmentId') departmentId: string,
    @Param('medicationId') medicationId: string,
  ) {
    return this.stockItemsService.findByDepartmentAndMedication(departmentId, medicationId);
  }
}