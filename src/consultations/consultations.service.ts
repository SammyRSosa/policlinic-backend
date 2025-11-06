import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Consultation,
  ProgrammedConsultation,
  EmergencyConsultation,
  ConsultationStatus,
} from './consultation.entity';
import { Patient } from 'src/patients/patient.entity';
import { Worker } from 'src/workers/worker.entity';
import { Department } from 'src/departments/department.entity';
import { InternalRemission, ExternalRemission } from 'src/remissions/remission.entity';

@Injectable()
export class ConsultationsService {
  constructor(
    @InjectRepository(Consultation)
    private consultationsRepo: Repository<Consultation>,

    @InjectRepository(ProgrammedConsultation)
    private programmedRepo: Repository<ProgrammedConsultation>,

    @InjectRepository(EmergencyConsultation)
    private emergencyRepo: Repository<EmergencyConsultation>,

    @InjectRepository(Patient)
    private patientsRepo: Repository<Patient>,

    @InjectRepository(Worker)
    private workersRepo: Repository<Worker>,

    @InjectRepository(Department)
    private departmentsRepo: Repository<Department>,

    @InjectRepository(InternalRemission)
    private internalRemRepo: Repository<InternalRemission>,

    @InjectRepository(ExternalRemission)
    private externalRemRepo: Repository<ExternalRemission>,
  ) { }

  async createProgrammed(patientId: string, mainDoctorId: string, departmentId: string, scheduledAt: Date, remissionId?: string, remissionType?: 'internal' | 'external') {
    const patient = await this.patientsRepo.findOne({ where: { id: patientId } });
    if (!patient) throw new NotFoundException('Patient not found');

    const doctor = await this.workersRepo.findOne({ where: { id: mainDoctorId } });
    if (!doctor) throw new NotFoundException('Doctor not found');

    const department = await this.departmentsRepo.findOne({ where: { id: departmentId } });
    if (!department) throw new NotFoundException('Department not found');

    let internalRemission, externalRemission;
    if (remissionId) {
      if (remissionType === 'internal') {
        internalRemission = await this.internalRemRepo.findOne({ where: { id: remissionId } });
      } else if (remissionType === 'external') {
        externalRemission = await this.externalRemRepo.findOne({ where: { id: remissionId } });
      }
    }

    const consultation = this.programmedRepo.create({
      mainDoctor: doctor,
      department,
      scheduledAt,
      internalRemission,
      externalRemission,
    });

    return this.programmedRepo.save(consultation);
  }

  async createEmergency(
    patientId: string,
    mainDoctorId: string,
    departmentId: string,
    // remove remission params
  ) {
    const patient = await this.patientsRepo.findOne({ where: { id: patientId } });
    if (!patient) throw new NotFoundException('Patient not found');

    const doctor = await this.workersRepo.findOne({ where: { id: mainDoctorId } });
    if (!doctor) throw new NotFoundException('Doctor not found');

    const department = await this.departmentsRepo.findOne({ where: { id: departmentId } });
    if (!department) throw new NotFoundException('Department not found');

    const consultation = this.emergencyRepo.create({
      patient,
      mainDoctor: doctor,
      department,
      status: ConsultationStatus.PENDING,
    });

    return this.emergencyRepo.save(consultation);
  }
  async findAll() {
    return this.consultationsRepo.find({
      relations: ['patient', 'mainDoctor', 'department', 'internalRemission', 'externalRemission'],
    });
  }

  async findOne(id: string) {
    const consultation = await this.consultationsRepo.findOne({
      where: { id },
      relations: ['patient', 'mainDoctor', 'department', 'internalRemission', 'externalRemission'],
    });
    if (!consultation) throw new NotFoundException('Consultation not found');
    return consultation;
  }

  async updateStatus(id: string, status: ConsultationStatus, diagnosis?: string) {
    const consultation = await this.consultationsRepo.findOne({ where: { id } });
    if (!consultation) throw new NotFoundException('Consultation not found');

    consultation.status = status;
    if (diagnosis) consultation.diagnosis = diagnosis;

    return this.consultationsRepo.save(consultation);
  }
}
