import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Patch,
} from '@nestjs/common';
import { StockItemsService } from './stocks-items.service';
import { CreateStockItemDto } from './dto/create-stock-item.dto';
import { UpdateStockItemDto } from './dto/update-stock-item.dto';

@Controller('stock-items')
export class StockItemsController {
  constructor(private readonly stockItemsService: StockItemsService) {}

  // ⚠️ You will rarely need this manually now, but it’s fine to keep
  @Post('create/:departmentId')
  create(
    @Param('departmentId') departmentId: string,
    @Body() body: CreateStockItemDto,
  ) {
    return this.stockItemsService.create(
      departmentId,
      body.medicationId,
      body.quantity,
    );
  }

  @Get()
  findAll() {
    return this.stockItemsService.findAll();
  }

  @Get('department/:departmentId')
  findByDepartment(@Param('departmentId') departmentId: string) {
    return this.stockItemsService.findByDepartment(departmentId);
  }

  @Get('medication/:medicationId')
  findByMedication(@Param('medicationId') medicationId: string) {
    return this.stockItemsService.findByMedication(medicationId);
  }

  @Get('department/:departmentId/medication/:medicationId')
  findByDepartmentAndMedication(
    @Param('departmentId') departmentId: string,
    @Param('medicationId') medicationId: string,
  ) {
    return this.stockItemsService.findByDepartmentAndMedication(
      departmentId,
      medicationId,
    );
  }

  // ⭐ THE IMPORTANT ONE
  @Patch()
  update(
    @Body() dto: UpdateStockItemDto,
  ) {
    return this.stockItemsService.updateThresholds(dto);
  }
}
