import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MedicationOrderItem } from './medication-order-item.entity';
import { MedicationOrder } from '../medication-orders/medication-order.entity';
import { Medication } from '../medications/medication.entity';

@Injectable()
export class MedicationOrderItemsService {
  constructor(
    @InjectRepository(MedicationOrderItem)
    private itemsRepo: Repository<MedicationOrderItem>,

    @InjectRepository(MedicationOrder)
    private ordersRepo: Repository<MedicationOrder>,

    @InjectRepository(Medication)
    private medicationsRepo: Repository<Medication>,
  ) {}

  async create(orderId: string, medicationId: string, quantity: number) {
    if (!orderId || !medicationId || quantity <= 0) {
      throw new BadRequestException(
        'Order ID, Medication ID, and quantity > 0 are required',
      );
    }

    const order = await this.ordersRepo.findOne({
      where: { id: orderId },
    });
    if (!order) throw new NotFoundException('Medication order not found');

    const medication = await this.medicationsRepo.findOne({
      where: { id: medicationId },
    });
    if (!medication) throw new NotFoundException('Medication not found');

    const item = this.itemsRepo.create({
      medicationOrder: order,
      medication: medication,
      quantity: quantity,
    });

    return this.itemsRepo.save(item);
  }

  async findAll() {
    return this.itemsRepo.find({
      relations: ['medicationOrder', 'medication'],
    });
  }

  async findByOrder(orderId: string) {
    return this.itemsRepo.find({
      where: { medicationOrder: { id: orderId } },
      relations: ['medication', 'medicationOrder'],
    });
  }

  async updateQuantity(itemId: string, quantity: number) {
    if (quantity < 0) {
      throw new BadRequestException('Quantity cannot be negative');
    }

    const item = await this.itemsRepo.findOne({
      where: { id: itemId },
    });
    if (!item) throw new NotFoundException('Order item not found');

    item.quantity = quantity;
    return this.itemsRepo.save(item);
  }

  async remove(itemId: string) {
    const item = await this.itemsRepo.findOne({
      where: { id: itemId },
    });
    if (!item) throw new NotFoundException('Order item not found');

    return this.itemsRepo.remove(item);
  }
}