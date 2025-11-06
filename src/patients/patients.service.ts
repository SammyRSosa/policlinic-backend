import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient } from './patient.entity';
import { UserRole } from '../users/user.entity';

@Injectable()
export class PatientsService {
  constructor(
    @InjectRepository(Patient) private patientsRepo: Repository<Patient>,
  ) {}

  async create(dto: any, creator: any) {
    if (![UserRole.DOCTOR, UserRole.HEAD_OF_DEPARTMENT].includes(creator.role)) {
      throw new ForbiddenException('You cannot create patients');
    }
    const patient = this.patientsRepo.create(dto);
    return this.patientsRepo.save(patient);
  }

  findAll() {
    return this.patientsRepo.find();
  }
}
