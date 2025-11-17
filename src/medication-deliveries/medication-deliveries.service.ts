import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MedicationDelivery, DeliveryStatus } from './medication-delivery.entity';
import { MedicationDeliveryItem } from '../medication-deliveries-items/medication-delivery-item.entity';
import { Medication } from 'src/medications/medication.entity';
import { Department } from 'src/departments/department.entity';
import { Worker } from 'src/workers/worker.entity';

@Injectable()
export class MedicationDeliveryService {
  constructor(
    @InjectRepository(MedicationDelivery)
    private deliveryRepo: Repository<MedicationDelivery>,

    @InjectRepository(MedicationDeliveryItem)
    private itemsRepo: Repository<MedicationDeliveryItem>,

    @InjectRepository(Medication)
    private medicationsRepo: Repository<Medication>,

    @InjectRepository(Department)
    private departmentsRepo: Repository<Department>,

    @InjectRepository(Worker)
    private workersRepo: Repository<Worker>,
  ) {}

  async create(
    departmentId: string,
    requestedById: string | undefined,
    items: { medicationId: string; quantity: number }[],
  ) {
    // DEPARTMENT
    const department = await this.departmentsRepo.findOne({ where: { id: departmentId } });
    if (!department) throw new NotFoundException('Department not found');

    // WORKER (opcional)
    let requestedBy: Worker | undefined = undefined;
    if (requestedById) {
      const workerFound = await this.workersRepo.findOne({ where: { id: requestedById } });
      if (!workerFound) throw new NotFoundException('Worker not found');
      requestedBy = workerFound;
    }

    // CREAMOS EL DELIVERY
    const delivery = this.deliveryRepo.create({
      department,
      requestedBy,
      status: DeliveryStatus.PENDING,
      items: [],
    });

    await this.deliveryRepo.save(delivery);

    // CREAR ITEMS
    for (const item of items) {
      const medication = await this.medicationsRepo.findOne({ where: { id: item.medicationId } });
      if (!medication) throw new NotFoundException(`Medication ${item.medicationId} not found`);

      const deliveryItem = this.itemsRepo.create({
        medication,
        quantity: item.quantity,
        medicationDelivery: delivery,
      });

      await this.itemsRepo.save(deliveryItem);
      delivery.items.push(deliveryItem);
    }

    return delivery;
  }

  findAll() {
    return this.deliveryRepo.find({
      relations: ['items', 'items.medication', 'department', 'requestedBy'],
    });
  }

  async findOne(id: string) {
    const delivery = await this.deliveryRepo.findOne({
      where: { id },
      relations: ['items', 'items.medication', 'department', 'requestedBy'],
    });
    if (!delivery) throw new NotFoundException('Medication delivery not found');
    return delivery;
  }

  async updateStatus(id: string, status: DeliveryStatus) {
    const delivery = await this.findOne(id);
    delivery.status = status;
    return this.deliveryRepo.save(delivery);
  }

  async remove(id: string) {
    const delivery = await this.findOne(id);
    return this.deliveryRepo.remove(delivery);
  }
}
