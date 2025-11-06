import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MedicationOrderItem } from './medication-order-item.entity';
import { StockItem } from 'src/stock-items/stock-item.entity';
import { MedicationOrder } from 'src/medication-orders/medication-order.entity';

@Injectable()
export class MedicationOrderItemsService {
  constructor(
    @InjectRepository(MedicationOrderItem)
    private itemsRepo: Repository<MedicationOrderItem>,

    @InjectRepository(StockItem)
    private stockItemsRepo: Repository<StockItem>,

    @InjectRepository(MedicationOrder)
    private ordersRepo: Repository<MedicationOrder>,
  ) {}

  async create(orderId: string, stockItemId: string, quantity: number) {
    const order = await this.ordersRepo.findOne({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Medication order not found');

    const stockItem = await this.stockItemsRepo.findOne({ where: { id: stockItemId } });
    if (!stockItem) throw new NotFoundException('Stock item not found');

    const item = this.itemsRepo.create({ medicationOrder: order, stockItem, quantity });
    return this.itemsRepo.save(item);
  }

  async findAll() {
    return this.itemsRepo.find({ relations: ['medicationOrder', 'stockItem'] });
  }

  async findByOrder(orderId: string) {
    return this.itemsRepo.find({
      where: { medicationOrder: { id: orderId } },
      relations: ['stockItem', 'medicationOrder'],
    });
  }

  async updateQuantity(itemId: string, quantity: number) {
    const item = await this.itemsRepo.findOne({ where: { id: itemId } });
    if (!item) throw new NotFoundException('Item not found');
    item.quantity = quantity;
    return this.itemsRepo.save(item);
  }

  async remove(itemId: string) {
    const item = await this.itemsRepo.findOne({ where: { id: itemId } });
    if (!item) throw new NotFoundException('Item not found');
    return this.itemsRepo.remove(item);
  }
}
