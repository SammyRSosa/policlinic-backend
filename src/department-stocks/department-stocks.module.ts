import { Module } from '@nestjs/common';
import { DepartmentStocksService } from './department-stocks.service';
import { DepartmentStocksController } from './department-stocks.controller';

@Module({
  providers: [DepartmentStocksService],
  controllers: [DepartmentStocksController]
})
export class DepartmentStocksModule {}
