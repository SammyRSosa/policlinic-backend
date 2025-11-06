import { Module } from '@nestjs/common';
import { StockRequestsService } from './stock-requests.service';
import { StockRequestsController } from './stock-requests.controller';

@Module({
  providers: [StockRequestsService],
  controllers: [StockRequestsController]
})
export class StockRequestsModule {}
