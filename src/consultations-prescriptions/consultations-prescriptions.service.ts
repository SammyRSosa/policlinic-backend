import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConsultationPrescription } from './consultations-prescription.entity';
import { Consultation } from 'src/consultations/consultation.entity';
import { Medication } from 'src/medications/medication.entity';

@Injectable()
export class ConsultationPrescriptionsService {
  constructor(
    @InjectRepository(ConsultationPrescription)
    private prescriptionsRepo: Repository<ConsultationPrescription>,

    @InjectRepository(Consultation)
    private consultationsRepo: Repository<Consultation>,

    @InjectRepository(Medication)
    private medicationsRepo: Repository<Medication>,
  ) {}

  async create(consultationId: string, medicationId: string, quantity: number, instructions?: string) {
    const consultation = await this.consultationsRepo.findOne({ where: { id: consultationId } });
    if (!consultation) throw new NotFoundException('Consultation not found');

    const medication = await this.medicationsRepo.findOne({ where: { id: medicationId } });
    if (!medication) throw new NotFoundException('Medication not found');

    const prescription = this.prescriptionsRepo.create({
      consultation,
      medication,
      quantity,
      instructions,
    });

    return this.prescriptionsRepo.save(prescription);
  }

  findAll() {
    return this.prescriptionsRepo.find({ relations: ['consultation', 'medication'] });
  }

  async findOne(id: string) {
    const prescription = await this.prescriptionsRepo.findOne({ where: { id }, relations: ['consultation', 'medication'] });
    if (!prescription) throw new NotFoundException('Prescription not found');
    return prescription;
  }

  async remove(id: string) {
    const prescription = await this.findOne(id);
    return this.prescriptionsRepo.remove(prescription);
  }
}
