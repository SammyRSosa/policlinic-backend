import { Injectable, NotFoundException } from '@nestjs/common'; // ✅ Agregar NotFoundException
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Medication } from './medication.entity';
import { CreateMedicationDto } from './dto/create-medication.dto';

@Injectable()
export class MedicationsService {
  constructor(
    @InjectRepository(Medication)
    private medicationsRepository: Repository<Medication>,
  ) {}

  async create(createMedicationDto: CreateMedicationDto): Promise<Medication> {
    const medication = this.medicationsRepository.create(createMedicationDto);
    return this.medicationsRepository.save(medication);
  }

  async findAll(): Promise<Medication[]> {
    return this.medicationsRepository.find();
  }

  // ✅ CORREGIDO: Cambiar el tipo de retorno a Medication | null
  async findOne(id: string): Promise<Medication | null> {
    return this.medicationsRepository.findOne({ where: { id } });
  }

  async findOneOrFail(id: string): Promise<Medication> {
    const medication = await this.findOne(id);
    if (!medication) {
      throw new NotFoundException(`Medication with ID ${id} not found`);
    }
    return medication;
  }
}