import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MedicationDelivery, DeliveryStatus } from './medication-delivery.entity';
import { MedicationDeliveryItem } from '../medication-deliveries-items/medication-delivery-item.entity';
import { Department } from '../departments/department.entity';
import { Medication } from '../medications/medication.entity';
import { StockItem } from 'src/stock-items/stock-item.entity';

@Injectable()
export class MedicationDeliveriesService {
  constructor(
    @InjectRepository(MedicationDelivery)
    private deliveriesRepo: Repository<MedicationDelivery>,

    @InjectRepository(MedicationDeliveryItem)
    private itemsRepo: Repository<MedicationDeliveryItem>,

    @InjectRepository(Department)
    private departmentsRepo: Repository<Department>,

    @InjectRepository(Medication)
    private medicationsRepo: Repository<Medication>,

    @InjectRepository(StockItem)
    private stockItemsRepo: Repository<StockItem>,
  ) {}

  async create(body: {
    departmentId: string;
    items: { medicationId: string; quantity: number }[];
  }) {
    if (!body.departmentId) {
      throw new BadRequestException('Department ID is required');
    }

    if (!body.items || body.items.length === 0) {
      throw new BadRequestException('At least one item is required');
    }

    const department = await this.departmentsRepo.findOne({
      where: { id: body.departmentId },
    });
    if (!department) throw new NotFoundException('Department not found');

    const delivery = this.deliveriesRepo.create({
      department,
      status: DeliveryStatus.PENDING,
    });
    const savedDelivery = await this.deliveriesRepo.save(delivery);

    for (const itemData of body.items) {
      if (!itemData.medicationId || itemData.quantity <= 0) {
        throw new BadRequestException('Invalid medication or quantity');
      }

      const medication = await this.medicationsRepo.findOne({
        where: { id: itemData.medicationId },
      });
      if (!medication) {
        throw new NotFoundException(`Medication ${itemData.medicationId} not found`);
      }

      const item = this.itemsRepo.create({
        medicationDelivery: savedDelivery,
        medication,
        quantity: itemData.quantity,
      });
      await this.itemsRepo.save(item);
    }

    return this.findOne(savedDelivery.id);
  }

  async findAll() {
    return this.deliveriesRepo.find({
      relations: ['department', 'items', 'items.medication'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const delivery = await this.deliveriesRepo.findOne({
      where: { id },
      relations: ['department', 'items', 'items.medication'],
    });
    if (!delivery) throw new NotFoundException('Delivery not found');
    return delivery;
  }

  async findByDepartment(departmentId: string) {
    return this.deliveriesRepo.find({
      where: { department: { id: departmentId } },
      relations: ['department', 'items', 'items.medication'],
      order: { createdAt: 'DESC' },
    });
  }

  async updateStatus(id: string, status: DeliveryStatus, comment?: string) {
    const delivery = await this.findOne(id);
    const previousStatus = delivery.status;

    delivery.status = status;

    if (comment) {
      delivery.comment = comment;
    }

    // Case 1: Delivery is CONFIRMED/DELIVERED
    if (status === DeliveryStatus.DELIVERED && previousStatus !== DeliveryStatus.DELIVERED) {
      // Add items to department stock
      for (const item of delivery.items) {
        const medication = item.medication;
        const deliveredQuantity = item.quantity;

        let deptStock = await this.stockItemsRepo.findOne({
          where: {
            medication: { id: medication.id },
            department: { id: delivery.department.id },
          },
        });

        if (deptStock) {
          deptStock.quantity += deliveredQuantity;
          await this.stockItemsRepo.save(deptStock);
        } else {
          const newDeptStock = new StockItem();
          newDeptStock.medication = medication;
          newDeptStock.department = delivery.department;
          newDeptStock.quantity = deliveredQuantity;
          await this.stockItemsRepo.save(newDeptStock);
        }
      }
    }

    // Case 2: Delivery is CANCELED - Return items to Almacén stock
    if (status === DeliveryStatus.CANCELED && previousStatus !== DeliveryStatus.CANCELED) {
      // Get Almacén department
      const almacenDept = await this.departmentsRepo.findOne({
        where: { name: 'Almacén' },
      });

      if (!almacenDept) {
        throw new NotFoundException('Almacén department not found');
      }

      // Return each item back to Almacén stock
      for (const item of delivery.items) {
        const medication = item.medication;
        const returnQuantity = item.quantity;

        let almacenStock = await this.stockItemsRepo.findOne({
          where: {
            medication: { id: medication.id },
            department: { id: almacenDept.id },
          },
        });

        if (almacenStock) {
          // Add back to existing stock
          almacenStock.quantity += returnQuantity;
          await this.stockItemsRepo.save(almacenStock);
        } else {
          // Create new stock entry if it doesn't exist
          const newAlmacenStock = new StockItem();
          newAlmacenStock.medication = medication;
          newAlmacenStock.department = almacenDept;
          newAlmacenStock.quantity = returnQuantity;
          await this.stockItemsRepo.save(newAlmacenStock);
        }
      }
    }

    return this.deliveriesRepo.save(delivery);
  }

  async delete(id: string) {
    const delivery = await this.findOne(id);
    await this.deliveriesRepo.remove(delivery);
    return { message: 'Delivery deleted successfully' };
  }
}