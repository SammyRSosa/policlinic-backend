// medication-deliveries.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MedicationDelivery, DeliveryStatus } from './medication-delivery.entity';
import { MedicationDeliveryItem } from '../medication-deliveries-items/medication-delivery-item.entity';
import { Department } from '../departments/department.entity';
import { Medication } from '../medications/medication.entity';
import { Worker } from '../workers/worker.entity';

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

    @InjectRepository(Worker)
    private workersRepo: Repository<Worker>,
  ) {}

  async create(body: {
    departmentId: string;
    items: { medicationId: string; quantity: number }[];
  }) {
    // Get department
    const department = await this.departmentsRepo.findOne({
      where: { id: body.departmentId },
    });
    if (!department) throw new NotFoundException('Department not found');

    // Create delivery
    const delivery = this.deliveriesRepo.create({
      department,
      status: DeliveryStatus.PENDING,
    });
    const savedDelivery = await this.deliveriesRepo.save(delivery);

    // Create items for this delivery
    for (const itemData of body.items) {
      const medication = await this.medicationsRepo.findOne({
        where: { id: itemData.medicationId },
      });
      if (!medication) {
        throw new NotFoundException(
          `Medication ${itemData.medicationId} not found`,
        );
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
      relations: [
        'department',
        'requestedBy',
        'items',
        'items.medication',
      ],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const delivery = await this.deliveriesRepo.findOne({
      where: { id },
      relations: [
        'department',
        'requestedBy',
        'items',
        'items.medication',
      ],
    });
    if (!delivery) throw new NotFoundException('Delivery not found');
    return delivery;
  }

  async findByDepartment(departmentId: string) {
    return this.deliveriesRepo.find({
      where: { department: { id: departmentId } },
      relations: [
        'department',
        'requestedBy',
        'items',
        'items.medication',
      ],
      order: { createdAt: 'DESC' },
    });
  }

  async updateStatus(id: string, status: DeliveryStatus) {
    const delivery = await this.findOne(id);
    delivery.status = status;
    return this.deliveriesRepo.save(delivery);
  }

  async delete(id: string) {
    const delivery = await this.findOne(id);
    await this.deliveriesRepo.remove(delivery);
    return { message: 'Delivery deleted successfully' };
  }
}