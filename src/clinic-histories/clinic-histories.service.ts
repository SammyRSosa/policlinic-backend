import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClinicHistory } from './clinic-history.entity';
import { Patient } from 'src/patients/patient.entity';
import { UserRole } from 'src/users/user.entity';

@Injectable()
export class ClinicHistoryService {
  constructor(
    @InjectRepository(ClinicHistory)
    private historyRepo: Repository<ClinicHistory>,
    @InjectRepository(Patient)
    private patientsRepo: Repository<Patient>,
  ) {}

  async create(patientId: string, notes?: string) {
    const patient = await this.patientsRepo.findOne({ where: { id: patientId } });
    if (!patient) throw new NotFoundException('Patient not found');

    const history = this.historyRepo.create({ patient, notes });
    return this.historyRepo.save(history);
  }

  findAll() {
    return this.historyRepo.find({ relations: ['patient', 'consultations'] });
  }

  async findOne(id: string) {
    const history = await this.historyRepo.findOne({ where: { id }, relations: ['patient', 'consultations'] });
    if (!history) throw new NotFoundException('Clinic history not found');
    return history;
  }

  async findOneSecured(id: string, user: any) {
  const history = await this.historyRepo.findOne({
    where: { id },
    relations: ['patient', 'consultations'],
  });
  if (!history) throw new NotFoundException('Clinic history not found');

  // Patients can only access their own
  if (user.role === UserRole.PATIENT && user.patient?.id !== history.patient.id) {
    throw new ForbiddenException('You can only view your own clinic history');
  }

  return history;
}

  async findByPatient(patientId: string, user: any) {
    const patient = await this.patientsRepo.findOne({ where: { id: patientId } });
    if (!patient) throw new NotFoundException('Patient not found');

    // Patients can only access their own clinic histories
    if (user.role === UserRole.PATIENT && user.patient?.id !== patientId) {
      throw new ForbiddenException('You can only view your own clinic histories');
    }

    return this.historyRepo.find({
      where: { patient: { id: patientId } },
      relations: ['patient', 'consultations'],
      order: { createdAt: 'DESC' },
    });
  }

  async update(id: string, notes: string) {
    const history = await this.findOne(id);
    history.notes = notes;
    return this.historyRepo.save(history);
  }

  async remove(id: string) {
    const history = await this.findOne(id);
    return this.historyRepo.remove(history);
  }
}
