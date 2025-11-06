import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MedicationDelivery, DeliveryStatus } from './medication-delivery.entity';
import { Medication } from 'src/medications/medication.entity';
import { Department } from 'src/departments/department.entity';
import { Worker } from 'src/workers/worker.entity';

@Injectable()
export class MedicationDeliveryService {
  constructor(
    @InjectRepository(MedicationDelivery)
    private deliveryRepo: Repository<MedicationDelivery>,
    @InjectRepository(Medication)
    private medicationsRepo: Repository<Medication>,
    @InjectRepository(Department)
    private departmentsRepo: Repository<Department>,
    @InjectRepository(Worker)
    private workersRepo: Repository<Worker>,
  ) {}

  async create(
    medicationId: string,
    departmentId: string,
    quantity: number,
    requestedById?: string,
  ) {
    const medication = await this.medicationsRepo.findOne({ where: { id: medicationId } });
    if (!medication) throw new NotFoundException('Medication not found');

    const department = await this.departmentsRepo.findOne({ where: { id: departmentId } });
    if (!department) throw new NotFoundException('Department not found');

    let requestedBy: Worker | undefined = undefined;
    if (requestedById) {
      const foundWorker = await this.workersRepo.findOne({ where: { id: requestedById } });
      if (!foundWorker) throw new NotFoundException('Worker not found');
      requestedBy = foundWorker ?? undefined;
    }

    const delivery = this.deliveryRepo.create({
      medication,
      department,
      quantity,
      requestedBy,
      status: DeliveryStatus.PENDING,
    });

    return this.deliveryRepo.save(delivery);
  }

  findAll() {
    return this.deliveryRepo.find({ relations: ['medication', 'department', 'requestedBy'] });
  }

  async findOne(id: string) {
    const delivery = await this.deliveryRepo.findOne({
      where: { id },
      relations: ['medication', 'department', 'requestedBy'],
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
