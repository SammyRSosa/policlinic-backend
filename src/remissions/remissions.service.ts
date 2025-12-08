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
import { MedicalPost } from 'src/medical-posts/medical-post.entity';

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
    @InjectRepository(MedicalPost)
    private medicalPostsRepo: Repository<MedicalPost>,
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

  async createExternal(patientId: string, toDepartmentId: string, medicalPostId: number) {
    const patient = await this.patientsRepo.findOne({ where: { id: patientId } });
    if (!patient) throw new NotFoundException('Patient not found');

    const toDepartment = await this.departmentsRepo.findOne({
      where: { id: toDepartmentId },
    });
    if (!toDepartment) throw new NotFoundException('Department not found');

    const medicalPost = await this.medicalPostsRepo.findOne({ where: { id: medicalPostId } });
    if (!medicalPost) throw new NotFoundException('Medical post not found');

    const remission = this.externalRepo.create({
      patient,
      toDepartment,
      medicalPost,
    });

    return this.externalRepo.save(remission);
  }

  async findAll() {
    return this.remissionsRepo.find({
      relations: ['patient', 'toDepartment', 'consultation','medicalPost','fromDepartment'],
    });
  }

  async findByDepartment(departmentId: string) {
    const department = await this.departmentsRepo.findOne({ where: { id: departmentId } });
    if (!department) throw new NotFoundException('Department not found');

    return this.remissionsRepo.find({
      where: { toDepartment: { id: departmentId } },
      relations: ['patient', 'toDepartment', 'consultation'],
      order: { createdAt: 'DESC' },
    });
  }

  async findFromDepartment(departmentId: string) {
    const department = await this.departmentsRepo.findOne({ where: { id: departmentId } });
    if (!department) throw new NotFoundException('Department not found');

    return this.internalRepo.find({
      where: { fromDepartment: { id: departmentId } },
      relations: ['patient', 'fromDepartment', 'toDepartment', 'consultation'],
      order: { createdAt: 'DESC' },
    });
  }

  async findFromMedicalPost(medicalPostId: string) {
    const medicalPost = await this.medicalPostsRepo.findOne({ where: { id: Number(medicalPostId) } });
    if (!medicalPost) throw new NotFoundException('Medical post not found');

    return this.externalRepo.find({
      where: { medicalPost: { id: Number(medicalPostId) } },
      relations: ['patient', 'medicalPost', 'toDepartment', 'consultation'],
      order: { createdAt: 'DESC' },
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

  async remove(id: string) {
    const remission = await this.findOne(id);
    return this.remissionsRepo.remove(remission);
  }
}
