import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { MedicationDeliveryItem } from './medication-delivery-item.entity';
import { MedicationDelivery } from '../medication-deliveries/medication-delivery.entity';
import { Medication } from 'src/medications/medication.entity';
import { StockItem } from 'src/stock-items/stock-item.entity';


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

  ) { }

/** CREATE ITEM */
async create(deliveryId: string, medicationId: string, quantity: number) {
  // Obtener el delivery
  const delivery = await this.deliveriesRepo.findOne({
    where: { id: deliveryId },
    relations: ['department'], // importante para obtener el depto
  });
  if (!delivery) throw new NotFoundException('Medication delivery not found');

  // Obtener el medicamento
  const medication = await this.medicationsRepo.findOne({
    where: { id: medicationId },
  });
  if (!medication) throw new NotFoundException('Medication not found');

  // Buscar stock del medicamento en este departamento
  const stockItem = await this.stockRepo.findOne({
    where: {
      department: { id: delivery.department.id },
      medication: { id: medicationId },
    },
    relations: ['department', 'medication'],
  });

  if (!stockItem) {
    throw new NotFoundException(
      `No hay stock del medicamento ${medication.name} en el departamento ${delivery.department.name}`,
    );
  }

  // Verificar suficiente stock
  if (stockItem.quantity < quantity) {
    throw new NotFoundException(
      `Stock insuficiente para ${medication.name}. Disponible: ${stockItem.quantity}`,
    );
  }

  // Restar cantidad
  stockItem.quantity -= quantity;
  await this.stockRepo.save(stockItem);

  // Crear ítem del delivery
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
