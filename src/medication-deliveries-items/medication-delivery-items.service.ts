import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { MedicationDeliveryItem } from './medication-delivery-item.entity';
import { MedicationDelivery } from '../medication-deliveries/medication-delivery.entity';
import { Medication } from 'src/medications/medication.entity';

@Injectable()
export class MedicationDeliveryItemsService {
  constructor(
    @InjectRepository(MedicationDeliveryItem)
    private itemsRepo: Repository<MedicationDeliveryItem>,

    @InjectRepository(MedicationDelivery)
    private deliveriesRepo: Repository<MedicationDelivery>,

    @InjectRepository(Medication)
    private medicationsRepo: Repository<Medication>,
  ) {}

  /** CREATE ITEM */
  async create(deliveryId: string, medicationId: string, quantity: number) {
    const delivery = await this.deliveriesRepo.findOne({
      where: { id: deliveryId },
      relations: ['department', 'requestedBy'],
    });
    if (!delivery) throw new NotFoundException('Medication delivery not found');

    const medication = await this.medicationsRepo.findOne({
      where: { id: medicationId },
    });
    if (!medication) throw new NotFoundException('Medication not found');

    const item = this.itemsRepo.create({
      medicationDelivery: delivery,
      medication,
      quantity,
    });

    return this.itemsRepo.save(item);
  }

  /** GET ALL ITEMS */
  async findAll() {
    return this.itemsRepo.find({
      relations: ['medicationDelivery', 'medication'],
    });
  }

  /** GET ITEMS BY DELIVERY */
  async findByDelivery(deliveryId: string) {
    return this.itemsRepo.find({
      where: { medicationDelivery: { id: deliveryId } },
      relations: ['medication', 'medicationDelivery'],
    });
  }

  /** UPDATE QUANTITY */
  async updateQuantity(itemId: string, quantity: number) {
    const item = await this.itemsRepo.findOne({ where: { id: itemId } });

    if (!item) throw new NotFoundException('Medication delivery item not found');

    item.quantity = quantity;
    return this.itemsRepo.save(item);
  }

  /** DELETE ITEM */
  async remove(itemId: string) {
    const item = await this.itemsRepo.findOne({ where: { id: itemId } });

    if (!item) throw new NotFoundException('Medication delivery item not found');

    return this.itemsRepo.remove(item);
  }
}
