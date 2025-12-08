import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedicationOrdersService } from './medication-orders.service';
import { MedicationOrdersController } from './medication-orders.controller';
import { MedicationOrder } from './medication-order.entity';
import { MedicationOrderItem } from '../medication-order-items/medication-order-item.entity';
import { Department } from '../departments/department.entity';
import { HeadOfDepartment } from '../heads-of-departments/head-of-department.entity';
import { Medication } from '../medications/medication.entity';
import { StockItem } from '../stock-items/stock-item.entity';
import { MedicationDelivery } from '../medication-deliveries/medication-delivery.entity';
import { MedicationDeliveryItem } from '../medication-deliveries-items/medication-delivery-item.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MedicationOrder,
      MedicationOrderItem,
      Department,
      HeadOfDepartment,
      Medication,
      StockItem,
      MedicationDelivery,
      MedicationDeliveryItem,
    ]),
  ],
  providers: [MedicationOrdersService],
  controllers: [MedicationOrdersController],
  exports: [MedicationOrdersService],
})
export class MedicationOrdersModule {}