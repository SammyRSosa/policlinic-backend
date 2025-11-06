import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MedicationOrder, MedicationOrderStatus } from './medication-order.entity';
import { MedicationOrderItem } from 'src/medication-order-items/medication-order-item.entity';
import { Department } from 'src/departments/department.entity';
import { HeadOfDepartment } from 'src/heads-of-departments/head-of-department.entity';
import { StockItem } from 'src/stock-items/stock-item.entity';

@Injectable()
export class MedicationOrdersService {
  constructor(
    @InjectRepository(MedicationOrder)
    private ordersRepo: Repository<MedicationOrder>,

    @InjectRepository(MedicationOrderItem)
    private itemsRepo: Repository<MedicationOrderItem>,

    @InjectRepository(Department)
    private departmentsRepo: Repository<Department>,

    @InjectRepository(HeadOfDepartment)
    private headsRepo: Repository<HeadOfDepartment>,

    @InjectRepository(StockItem)
    private stockItemsRepo: Repository<StockItem>,
  ) {}

  async create(
    departmentId: string,
    headId: string,
    requestedItems: { stockItemId: string; quantity: number }[],
  ) {
    const department = await this.departmentsRepo.findOne({ where: { id: departmentId } });
    if (!department) throw new NotFoundException('Department not found');

    const head = await this.headsRepo.findOne({ where: { id: headId } });
    if (!head) throw new NotFoundException('Head of Department not found');

    const orderItems: MedicationOrderItem[] = [];
    for (const item of requestedItems) {
      const stockItem = await this.stockItemsRepo.findOne({ where: { id: item.stockItemId } });
      if (!stockItem) throw new NotFoundException(`Stock item ${item.stockItemId} not found`);

      orderItems.push(this.itemsRepo.create({ stockItem, quantity: item.quantity }));
    }

    const order = this.ordersRepo.create({ department, head, items: orderItems });
    return this.ordersRepo.save(order);
  }

  async findAll() {
    return this.ordersRepo.find({ relations: ['department', 'head', 'items', 'items.stockItem'] });
  }

  async respond(orderId: string, accept: boolean) {
    const order = await this.ordersRepo.findOne({ where: { id: orderId }, relations: ['items', 'items.stockItem'] });
    if (!order) throw new NotFoundException('Order not found');

    order.status = accept ? MedicationOrderStatus.ACCEPTED : MedicationOrderStatus.DENIED;
    order.respondedAt = new Date();

    if (accept) {
      for (const item of order.items) {
        item.stockItem.quantity -= item.quantity;
        await this.stockItemsRepo.save(item.stockItem);
      }
    }

    return this.ordersRepo.save(order);
  }
}
