import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StockItem } from './stock-item.entity';
import { Department } from '../departments/department.entity';
import { Medication } from '../medications/medication.entity'; // ✅ Nueva import
import { StockItemsService } from './stocks-items.service';
import { StockItemsController } from './stock-items.controller';

@Module({
  imports: [TypeOrmModule.forFeature([StockItem, Department, Medication])], // ✅ Agregar Medication
  providers: [StockItemsService],
  controllers: [StockItemsController],
  exports: [StockItemsService],
})
export class StockItemsModule {}