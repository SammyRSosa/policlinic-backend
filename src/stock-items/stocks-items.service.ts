import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StockItem } from './stock-item.entity';
import { Stock } from 'src/stocks/stock.entity';

@Injectable()
export class StockItemsService {
  constructor(
    @InjectRepository(StockItem)
    private itemsRepo: Repository<StockItem>,
    @InjectRepository(Stock)
    private stocksRepo: Repository<Stock>,
  ) {}

  async create(stockId: string, medicationName: string, quantity = 0) {
    const stock = await this.stocksRepo.findOne({ where: { id: stockId } });
    if (!stock) throw new NotFoundException('Stock not found');

    const item = this.itemsRepo.create({ stock, medicationName, quantity });
    return this.itemsRepo.save(item);
  }

  async findAll() {
    return this.itemsRepo.find({ relations: ['stock'] });
  }

  async findByStock(stockId: string) {
    return this.itemsRepo.find({ where: { stock: { id: stockId } } });
  }

  async updateQuantity(itemId: string, quantity: number) {
    const item = await this.itemsRepo.findOne({ where: { id: itemId } });
    if (!item) throw new NotFoundException('Stock item not found');
    item.quantity = quantity;
    return this.itemsRepo.save(item);
  }
}
