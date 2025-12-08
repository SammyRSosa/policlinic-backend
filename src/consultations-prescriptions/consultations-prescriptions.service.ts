import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConsultationPrescription } from './consultations-prescription.entity';
import { Consultation } from 'src/consultations/consultation.entity';
import { Medication } from 'src/medications/medication.entity';
import { StockItem } from 'src/stock-items/stock-item.entity';

@Injectable()
export class ConsultationPrescriptionsService {
  constructor(
    @InjectRepository(ConsultationPrescription)
    private prescriptionsRepo: Repository<ConsultationPrescription>,

    @InjectRepository(Consultation)
    private consultationsRepo: Repository<Consultation>,

    @InjectRepository(Medication)
    private medicationsRepo: Repository<Medication>,

    @InjectRepository(StockItem)
    private stockItemsRepo: Repository<StockItem>,
  ) {}

  async create(
    consultationId: string,
    medicationId: string,
    quantity: number,
    instructions?: string,
  ) {
    const consultation = await this.consultationsRepo.findOne({
      where: { id: consultationId },
      relations: ['department'],
    });
    if (!consultation) throw new NotFoundException('Consultation not found');

    const medication = await this.medicationsRepo.findOne({
      where: { id: medicationId },
    });
    if (!medication) throw new NotFoundException('Medication not found');

    // Get the stock item for this medication in the consultation's department
    const stockItem = await this.stockItemsRepo.findOne({
      where: {
        medication: { id: medicationId },
        department: { id: consultation.department.id },
      },
      relations: ['medication', 'department'],
    });

    if (!stockItem) {
      throw new NotFoundException(
        `Medication stock not found in ${consultation.department.name} department`,
      );
    }

    // Check if there's enough stock
    if (stockItem.quantity < quantity) {
      throw new BadRequestException(
        `Insufficient stock. Available: ${stockItem.quantity}, Requested: ${quantity}`,
      );
    }

    // Create the prescription
    const prescription = this.prescriptionsRepo.create({
      consultation,
      medication,
      quantity,
      instructions,
    });

    const savedPrescription = await this.prescriptionsRepo.save(prescription);

    // Deduct the quantity from the stock
    stockItem.quantity -= quantity;
    await this.stockItemsRepo.save(stockItem);

    return savedPrescription;
  }

  findAll() {
    return this.prescriptionsRepo.find({
      relations: ['consultation', 'medication'],
    });
  }

  async findOne(id: string) {
    const prescription = await this.prescriptionsRepo.findOne({
      where: { id },
      relations: ['consultation', 'medication'],
    });
    if (!prescription) throw new NotFoundException('Prescription not found');
    return prescription;
  }

  async remove(id: string) {
    const prescription = await this.prescriptionsRepo.findOne({
      where: { id },
      relations: ['consultation', 'medication', 'consultation.department'],
    });

    if (!prescription) throw new NotFoundException('Prescription not found');

    // Restore the stock when prescription is deleted
    const stockItem = await this.stockItemsRepo.findOne({
      where: {
        medication: { id: prescription.medication.id },
        department: { id: prescription.consultation.department.id },
      },
    });

    if (stockItem) {
      stockItem.quantity += prescription.quantity;
      await this.stockItemsRepo.save(stockItem);
    }

    return this.prescriptionsRepo.remove(prescription);
  }
}