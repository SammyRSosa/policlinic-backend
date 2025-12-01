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
import { InternalRemission, ExternalRemission, Remission } from 'src/remissions/remission.entity';

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

    @InjectRepository(Remission)
    private RemRepo: Repository<Remission>,

    @InjectRepository(ExternalRemission)
    private externalRemRepo: Repository<ExternalRemission>,
  ) { }

  async createProgrammed(patientId: string, mainDoctorId: string, scheduledAt: Date, remissionId?: string, remissionType?: 'internal' | 'external') {
   console.log(remissionId, remissionType);
    const patient = await this.patientsRepo.findOne({ where: { id: patientId } });
    if (!patient) throw new NotFoundException('Patient not found');

    const doctor = await this.workersRepo.findOne({ where: { id: mainDoctorId }, relations: ['department'] });
    if (!doctor) throw new NotFoundException('Doctor not found');
    if (!doctor.department) throw new NotFoundException('Doctor has no assigned department');

    let internalRemission, externalRemission;
    if (remissionId) {
        internalRemission = await this.RemRepo.findOne({ where: { id: remissionId } });
    }
    if (internalRemission.medicalPost){
        externalRemission = internalRemission as ExternalRemission;
        internalRemission = null;
    } 

    const consultation = this.programmedRepo.create({
      mainDoctor: doctor,
      Doctor: doctor, // Set Doctor field as well
      department: doctor.department,
      scheduledAt,
      internalRemission,
      externalRemission,
    });

    return this.programmedRepo.save(consultation);
  }

  async createEmergency(
    patientId: string,
    mainDoctorId: string,
  ) {
    const patient = await this.patientsRepo.findOne({ where: { id: patientId } });
    if (!patient) throw new NotFoundException('Patient not found');

    const doctor = await this.workersRepo.findOne({ where: { id: mainDoctorId }, relations: ['department'] });
    if (!doctor) throw new NotFoundException('Doctor not found');
    if (!doctor.department) throw new NotFoundException('Doctor has no assigned department');

    const consultation = this.emergencyRepo.create({
      patient,
      mainDoctor: doctor,
      Doctor: doctor, // Set Doctor field as well
      department: doctor.department,
      status: ConsultationStatus.PENDING,
    });

    return this.emergencyRepo.save(consultation);
  }
  async findAll() {
    return this.consultationsRepo.find({
      relations: ['patient', 'mainDoctor', 'department', 'internalRemission', 'externalRemission'],
    });
  }

  async findByDepartment(departmentId: string) {
    return this.consultationsRepo.find({
      where: { department: { id: departmentId } },
      relations: ['mainDoctor', 'Doctor', 'clinicHistory', 'prescriptions'],
      order: { createdAt: 'DESC' },
    });
  }


  async findByWorker(workerId: string) {
    return this.consultationsRepo.find({
      where: { mainDoctor: { id: workerId } },
      relations: ['department', 'clinicHistory', 'prescriptions','patient', 'mainDoctor', 'department', 'internalRemission', 'externalRemission'],
      order: { createdAt: 'DESC' },
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

  async delete(id: string) {
    const consultation = await this.findOne(id);
    return this.consultationsRepo.remove(consultation); 
  }
}
