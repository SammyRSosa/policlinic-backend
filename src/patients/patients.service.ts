import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient } from './patient.entity';
import { User, UserRole } from '../users/user.entity';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';

@Injectable()
export class PatientsService {
  constructor(
    @InjectRepository(Patient) private patientsRepo: Repository<Patient>,
  ) {}

  async create(dto: CreatePatientDto, creator: User) {
    // if (![UserRole.DOCTOR, UserRole.HEAD_OF_DEPARTMENT].includes(creator.role)) {
    //   throw new ForbiddenException('You cannot create patients');
    // }
    const patient = this.patientsRepo.create(dto);
    return this.patientsRepo.save(patient);
  }

  findAll() {
    return this.patientsRepo.find();
  }

  async update(id: string, dto: UpdatePatientDto) {
    const patient = await this.patientsRepo.findOne({ where: { id } });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    // Mezcla campos actuales con los nuevos
    const updatedPatient = Object.assign(patient, dto);

    return await this.patientsRepo.save(updatedPatient);
  }

  async remove(id: string) {
    const patient = await this.patientsRepo.findOne({ where: { id } });
    if (!patient) throw new NotFoundException('User not found');
    return this.patientsRepo.remove(patient);
  }
}
