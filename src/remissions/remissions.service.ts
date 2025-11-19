import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Remission,
  InternalRemission,
  ExternalRemission,
} from './remission.entity';
import { Patient } from 'src/patients/patient.entity';
import { Department } from 'src/departments/department.entity';
import { Consultation } from 'src/consultations/consultation.entity';

@Injectable()
export class RemissionsService {
  constructor(
    @InjectRepository(Remission)
    private remissionsRepo: Repository<Remission>,
    @InjectRepository(InternalRemission)
    private internalRepo: Repository<InternalRemission>,
    @InjectRepository(ExternalRemission)
    private externalRepo: Repository<ExternalRemission>,
    @InjectRepository(Patient)
    private patientsRepo: Repository<Patient>,
    @InjectRepository(Department)
    private departmentsRepo: Repository<Department>,
    @InjectRepository(Consultation)
    private consultationsRepo: Repository<Consultation>,
  ) {}

  async createInternal(
    patientId: string,
    fromDepartmentId: string,
    toDepartmentId: string,
  ) {
    const patient = await this.patientsRepo.findOne({
      where: { id: patientId },
    });
    if (!patient) throw new NotFoundException('Patient not found');

    const fromDepartment = await this.departmentsRepo.findOne({
      where: { id: fromDepartmentId },
    });
    if (!fromDepartment)
      throw new NotFoundException('From department not found');

    const toDepartment = await this.departmentsRepo.findOne({
      where: { id: toDepartmentId },
    });
    if (!toDepartment) throw new NotFoundException('To department not found');

    const remission = this.internalRepo.create({
      patient,
      fromDepartment,
      toDepartment,
    });
    return this.internalRepo.save(remission);
  }

  async createExternal(
    patientId: string,
    fromPost: string,
    toDepartmentId: string,
  ) {
    const patient = await this.patientsRepo.findOne({
      where: { id: patientId },
    });
    if (!patient) throw new NotFoundException('Patient not found');

    const toDepartment = await this.departmentsRepo.findOne({
      where: { id: toDepartmentId },
    });
    if (!toDepartment) throw new NotFoundException('Department not found');

    const remission = this.externalRepo.create({
      patient,
      fromPost,
      toDepartment,
    });
    return this.externalRepo.save(remission);
  }

  async findAll() {
    return this.remissionsRepo.find({
      relations: ['patient', 'toDepartment', 'consultation'],
    });
  }

  async findOne(id: string) {
    const remission = await this.remissionsRepo.findOne({
      where: { id },
      relations: ['patient', 'toDepartment', 'consultation'],
    });
    if (!remission) throw new NotFoundException('Remission not found');
    return remission;
  }
}
