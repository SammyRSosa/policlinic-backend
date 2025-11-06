import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Stock } from './stock.entity';
import { Medication } from 'src/medications/medication.entity';
import { Department } from 'src/departments/department.entity';
import { StocksService } from './stocks.service';
import { StocksController } from './stocks.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Stock, Medication, Department])],
  providers: [StocksService],
  controllers: [StocksController],
  exports: [StocksService],
})
export class StocksModule {}
