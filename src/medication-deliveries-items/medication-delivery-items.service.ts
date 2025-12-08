import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MedicationDeliveryItem } from './medication-delivery-item.entity';
import { MedicationDelivery } from '../medication-deliveries/medication-delivery.entity';
import { Medication } from '../medications/medication.entity';
import { StockItem } from '../stock-items/stock-item.entity';

@Injectable()
export class MedicationDeliveryItemsService {
  constructor(
    @InjectRepository(MedicationDeliveryItem)
    private itemsRepo: Repository<MedicationDeliveryItem>,

    @InjectRepository(MedicationDelivery)
    private deliveriesRepo: Repository<MedicationDelivery>,

    @InjectRepository(Medication)
    private medicationsRepo: Repository<Medication>,

    @InjectRepository(StockItem)
    private stockRepo: Repository<StockItem>,
  ) {}

  async create(
    deliveryId: string,
    medicationId: string,
    quantity: number,
  ) {
    if (!deliveryId || !medicationId || quantity <= 0) {
      throw new BadRequestException(
        'Delivery ID, Medication ID, and quantity > 0 are required',
      );
    }

    // Get delivery with department
    const delivery = await this.deliveriesRepo.findOne({
      where: { id: deliveryId },
      relations: ['department'],
    });
    if (!delivery) throw new NotFoundException('Medication delivery not found');

    // Get medication
    const medication = await this.medicationsRepo.findOne({
      where: { id: medicationId },
    });
    if (!medication) throw new NotFoundException('Medication not found');

    // Update or create stock in the department
    let stockItem = await this.stockRepo.findOne({
      where: {
        medication: { id: medicationId },
        department: { id: delivery.department.id },
      },
    });

    if (stockItem) {
      // Add to existing stock
      stockItem.quantity += quantity;
      await this.stockRepo.save(stockItem);
    } else {
      // Create new stock item
      const newStockItem = this.stockRepo.create({
        medication,
        department: delivery.department,
        quantity,
      });
      await this.stockRepo.save(newStockItem);
    }

    // Create delivery item
    const item = this.itemsRepo.create({
      medicationDelivery: delivery,
      medication,
      quantity,
    });

    return this.itemsRepo.save(item);
  }

  async findAll() {
    return this.itemsRepo.find({
      relations: ['medicationDelivery', 'medication'],
    });
  }

  async findByDelivery(deliveryId: string) {
    const items = await this.itemsRepo.find({
      where: { medicationDelivery: { id: deliveryId } },
      relations: ['medication', 'medicationDelivery'],
    });

    if (!items || items.length === 0) {
      throw new NotFoundException('No items found for this delivery');
    }

    return items;
  }

  async updateQuantity(itemId: string, newQuantity: number) {
    if (newQuantity < 0) {
      throw new BadRequestException('Quantity cannot be negative');
    }

    const item = await this.itemsRepo.findOne({
      where: { id: itemId },
      relations: ['medicationDelivery', 'medication'],
    });

    if (!item) throw new NotFoundException('Medication delivery item not found');

    const quantityDifference = newQuantity - item.quantity;

    // Update stock
    const stockItem = await this.stockRepo.findOne({
      where: {
        medication: { id: item.medication.id },
        department: { id: item.medicationDelivery.department.id },
      },
    });

    if (stockItem) {
      stockItem.quantity += quantityDifference;
      
      if (stockItem.quantity < 0) {
        throw new BadRequestException(
          `Cannot reduce stock below 0. Current: ${stockItem.quantity - quantityDifference}`,
        );
      }

      if (stockItem.quantity === 0) {
        await this.stockRepo.remove(stockItem);
      } else {
        await this.stockRepo.save(stockItem);
      }
    }

    item.quantity = newQuantity;
    return this.itemsRepo.save(item);
  }

  async remove(itemId: string) {
    const item = await this.itemsRepo.findOne({
      where: { id: itemId },
      relations: ['medicationDelivery', 'medication'],
    });

    if (!item) throw new NotFoundException('Medication delivery item not found');

    // Restore stock when deleting item
    const stockItem = await this.stockRepo.findOne({
      where: {
        medication: { id: item.medication.id },
        department: { id: item.medicationDelivery.department.id },
      },
    });

    if (stockItem) {
      stockItem.quantity -= item.quantity;
      
      if (stockItem.quantity <= 0) {
        await this.stockRepo.remove(stockItem);
      } else {
        await this.stockRepo.save(stockItem);
      }
    }

    return this.itemsRepo.remove(item);
  }
}