import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MedicationsService } from './medications.service';
import { MedicationsController } from './medications.controller';

import { Medication } from './medication.entity';
import { Department } from 'src/departments/department.entity';
import { StockItem } from 'src/stock-items/stock-item.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Medication,
      Department, // ✅ needed for relations / queries
      StockItem,  // ✅ needed for stock creation & joins
    ]),
  ],
  providers: [MedicationsService],
  controllers: [MedicationsController],
  exports: [
    MedicationsService,
    TypeOrmModule, // ⭐ allows other modules to inject Medication repo safely
  ],
})
export class MedicationsModule {}
