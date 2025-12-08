import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StockItem } from './stock-item.entity';
import { Department } from '../departments/department.entity';
import { Medication } from '../medications/medication.entity';

@Injectable()
export class StockItemsService {
  constructor(
    @InjectRepository(StockItem)
    private itemsRepo: Repository<StockItem>,
    @InjectRepository(Department)
    private departmentsRepo: Repository<Department>,
    @InjectRepository(Medication)
    private medicationsRepo: Repository<Medication>,
  ) {}

  // ✅ UPDATED: Check for existing stock and add to it
  async create(departmentId: string, medicationId: string, quantity = 0) {
    if (quantity < 0) {
      throw new BadRequestException('Quantity cannot be negative');
    }

    const department = await this.departmentsRepo.findOne({
      where: { id: departmentId },
    });
    if (!department) throw new NotFoundException('Department not found');

    const medication = await this.medicationsRepo.findOne({
      where: { id: medicationId },
    });
    if (!medication) throw new NotFoundException('Medication not found');

    // ✅ Check if stock item already exists for this department and medication
    const existingItem = await this.itemsRepo.findOne({
      where: {
        department: { id: departmentId },
        medication: { id: medicationId },
      },
    });

    if (existingItem) {
      // ✅ Add the new quantity to the existing stock
      existingItem.quantity += quantity;
      return this.itemsRepo.save(existingItem);
    }

    // ✅ Create new stock item if it doesn't exist
    const item = this.itemsRepo.create({
      department,
      medication,
      quantity,
    });
    return this.itemsRepo.save(item);
  }

  async findAll() {
    return this.itemsRepo.find({
      relations: ['department', 'medication'],
    });
  }

  async findByDepartment(departmentId: string) {
    return this.itemsRepo.find({
      where: { department: { id: departmentId } },
      relations: ['department', 'medication'],
    });
  }

  async findByMedication(medicationId: string) {
    return this.itemsRepo.find({
      where: { medication: { id: medicationId } },
      relations: ['department', 'medication'],
    });
  }

  async updateQuantity(itemId: string, quantity: number) {
    if (quantity < 0) {
      throw new BadRequestException('Quantity cannot be negative');
    }

    const item = await this.itemsRepo.findOne({
      where: { id: itemId },
      relations: ['medication'],
    });
    if (!item) throw new NotFoundException('Stock item not found');

    item.quantity = quantity;
    return this.itemsRepo.save(item);
  }

  // ✅ Add quantity to existing stock (incremental)
  async addQuantity(itemId: string, quantityToAdd: number) {
    if (quantityToAdd < 0) {
      throw new BadRequestException('Quantity to add cannot be negative');
    }

    const item = await this.itemsRepo.findOne({
      where: { id: itemId },
      relations: ['medication', 'department'],
    });
    if (!item) throw new NotFoundException('Stock item not found');

    item.quantity += quantityToAdd;
    return this.itemsRepo.save(item);
  }

  // ✅ Deduct quantity from stock (for prescriptions and usage)
  async deductQuantity(itemId: string, quantityToDeduct: number) {
    if (quantityToDeduct < 0) {
      throw new BadRequestException('Quantity to deduct cannot be negative');
    }

    const item = await this.itemsRepo.findOne({
      where: { id: itemId },
      relations: ['medication', 'department'],
    });
    if (!item) throw new NotFoundException('Stock item not found');

    if (item.quantity < quantityToDeduct) {
      throw new BadRequestException(
        `Insufficient stock for ${item.medication.name}. Available: ${item.quantity}, Requested: ${quantityToDeduct}`,
      );
    }

    item.quantity -= quantityToDeduct;
    return this.itemsRepo.save(item);
  }

  async findByDepartmentAndMedication(
    departmentId: string,
    medicationId: string,
  ) {
    return this.itemsRepo.findOne({
      where: {
        department: { id: departmentId },
        medication: { id: medicationId },
      },
      relations: ['department', 'medication'],
    });
  }

  // ✅ Delete stock item
  async remove(itemId: string) {
    const item = await this.itemsRepo.findOne({
      where: { id: itemId },
    });
    if (!item) throw new NotFoundException('Stock item not found');

    return this.itemsRepo.remove(item);
  }
}