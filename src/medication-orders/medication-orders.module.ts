import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedicationOrder } from './medication-order.entity';
import { MedicationOrderItem } from 'src/medication-order-items/medication-order-item.entity';
import { Department } from 'src/departments/department.entity';
import { HeadOfDepartment } from 'src/heads-of-departments/head-of-department.entity';
import { StockItem } from 'src/stock-items/stock-item.entity';
import { MedicationOrdersService } from './medication-orders.service';
import { MedicationOrdersController } from './medication-orders.controller';

@Module({
  imports: [TypeOrmModule.forFeature([MedicationOrder, MedicationOrderItem, Department, HeadOfDepartment, StockItem])],
  providers: [MedicationOrdersService],
  controllers: [MedicationOrdersController],
  exports: [MedicationOrdersService],
})
export class MedicationOrdersModule {}
