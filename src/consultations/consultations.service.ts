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
import { ClinicHistory } from 'src/clinic-histories/clinic-history.entity';
import { instanceToPlain } from 'class-transformer';

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

    @InjectRepository(ClinicHistory)
    private clinicHistoryRepo: Repository<ClinicHistory>,
  ) { }

  // -------------------------------------------------------
  //  CREATE PROGRAMMED CONSULTATION
  // -------------------------------------------------------
  async createProgrammed(
    patientId: string,
    mainDoctorId: string,
    scheduledAt: Date,
    remissionId?: string,
    remissionType?: 'internal' | 'external',
  ) {
    console.log(remissionId, remissionType);

    const patient = await this.patientsRepo.findOne({ where: { id: patientId } });
    if (!patient) throw new NotFoundException('Patient not found');

    const doctor = await this.workersRepo.findOne({
      where: { id: mainDoctorId },
      relations: ['department'],
    });
    if (!doctor) throw new NotFoundException('Doctor not found');
    if (!doctor.department) throw new NotFoundException('Doctor has no assigned department');

    let internalRemission, externalRemission;

    if (remissionId) {
      internalRemission = await this.RemRepo.findOne({ where: { id: remissionId } });
    }
    if (internalRemission?.medicalPost) {
      externalRemission = internalRemission as ExternalRemission;
      internalRemission = null;
    }

    const consultation = this.programmedRepo.create({
      mainDoctor: doctor,
      Doctor: doctor,
      department: doctor.department,
      scheduledAt,
      internalRemission,
      externalRemission,
    });

    if (internalRemission){
      internalRemission.consultation = consultation;
      await this.RemRepo.save(internalRemission);}
    else{
      externalRemission.consultation = consultation;
      await this.RemRepo.save(externalRemission);}


    const saved = await this.programmedRepo.save(consultation);

    await this.attachConsultationToPatientHistory(patientId, saved);

    return instanceToPlain(saved);
  }

  // -------------------------------------------------------
  //  CREATE EMERGENCY CONSULTATION
  // -------------------------------------------------------
  async createEmergency(patientId: string, mainDoctorId: string) {
    const patient = await this.patientsRepo.findOne({ where: { id: patientId } });
    if (!patient) throw new NotFoundException('Patient not found');

    const doctor = await this.workersRepo.findOne({
      where: { id: mainDoctorId },
      relations: ['department'],
    });
    if (!doctor) throw new NotFoundException('Doctor not found');
    if (!doctor.department) throw new NotFoundException('Doctor has no assigned department');

    const consultation = this.emergencyRepo.create({
      patient,
      mainDoctor: doctor,
      Doctor: doctor,
      department: doctor.department,
      status: ConsultationStatus.PENDING,
    });

    const saved = await this.emergencyRepo.save(consultation);

    await this.attachConsultationToPatientHistory(patientId, saved);

    return instanceToPlain(saved);
  }

  // -------------------------------------------------------
  //  LIST ALL CONSULTATIONS
  // -------------------------------------------------------
  async findAll() {
    const data = await this.consultationsRepo.find({
      relations: [
        'patient',
        'mainDoctor',
        'department',
        'internalRemission',
        'externalRemission',
      ],
    });

    return instanceToPlain(data);
  }

  // -------------------------------------------------------
  //  BY DEPARTMENT
  // -------------------------------------------------------
  async findByDepartment(departmentId: string) {
    const data = await this.consultationsRepo.find({
      where: { department: { id: departmentId } },
      relations: ['mainDoctor', 'Doctor', 'clinicHistory', 'prescriptions'],
      order: { createdAt: 'DESC' },
    });

    return instanceToPlain(data);
  }

  // -------------------------------------------------------
  //  BY DOCTOR / WORKER
  // -------------------------------------------------------
  async findByWorker(workerId: string) {
  const data = await this.consultationsRepo
    .createQueryBuilder('consultation')
    .leftJoinAndSelect('consultation.department', 'department')
    .leftJoinAndSelect('consultation.clinicHistory', 'clinicHistory')
    .leftJoinAndSelect('consultation.prescriptions', 'prescriptions')
    .leftJoinAndSelect('prescriptions.medication', 'medication')
    .leftJoinAndSelect('consultation.patient', 'patient')
    .leftJoinAndSelect('consultation.mainDoctor', 'mainDoctor')
    .leftJoinAndSelect('consultation.internalRemission', 'internalRemission')
    .leftJoinAndSelect('internalRemission.patient', 'internalRemissionPatient')
    .leftJoinAndSelect('consultation.externalRemission', 'externalRemission')
    .leftJoinAndSelect('externalRemission.patient', 'externalRemissionPatient')
    .where('consultation.mainDoctorId = :workerId', { workerId })
    .orderBy('consultation.createdAt', 'DESC')
    .getMany();

  return data;
}

   async findByNurse(nurseId: string) {
    const nurse = await this.workersRepo.findOne({
      where: { id: nurseId },
      relations: ['department'],
    });
    if (!nurse) throw new NotFoundException('Nurse not found');
    if (!nurse.department) throw new NotFoundException('Nurse has no assigned department');

    const departmentId = nurse.department.id;

    const data = await this.consultationsRepo.find({
      where: { department: { id: departmentId } },
      relations: [
        'department',
        'clinicHistory',
        'prescriptions',
        'patient',
        'mainDoctor',
        'department',
        'internalRemission',
        'externalRemission',
      ],
      order: { createdAt: 'DESC' },
    });

    return instanceToPlain(data);
  }

  // -------------------------------------------------------
  //  FIND ONE
  // -------------------------------------------------------
  async findOne(id: string) {
    const consultation = await this.consultationsRepo.findOne({
      where: { id },
      relations: ['patient', 'mainDoctor', 'department', 'internalRemission', 'externalRemission'],
    });

    if (!consultation) throw new NotFoundException('Consultation not found');

    return instanceToPlain(consultation);
  }

  // -------------------------------------------------------
  //  UPDATE STATUS
  // -------------------------------------------------------
  async updateStatus(id: string, status: ConsultationStatus, diagnosis?: string) {
    const consultation = await this.consultationsRepo.findOne({ where: { id } });
    if (!consultation) throw new NotFoundException('Consultation not found');

    consultation.status = status;
    if (diagnosis) consultation.diagnosis = diagnosis;

    const saved = await this.consultationsRepo.save(consultation);

    return instanceToPlain(saved);
  }

  // -------------------------------------------------------
  //  DELETE CONSULTATION
  // -------------------------------------------------------
  async delete(id: string) {
    const consultation = await this.consultationsRepo.findOne({ where: { id } });
    if (!consultation) throw new NotFoundException('Consultation not found');

    const removed = await this.consultationsRepo.remove(consultation);

    return instanceToPlain(removed);
  }

  // -------------------------------------------------------
  //  ATTACH CONSULTATION TO CLINIC HISTORY
  // -------------------------------------------------------

  private async attachConsultationToPatientHistory(patientId: string, consultation: Consultation) {
    const patient = await this.patientsRepo.findOne({
      where: { id: patientId },
      relations: ['clinicHistory', 'clinicHistory.consultations'], // <-- LOAD THE CONSULTATIONS
    });
    if (!patient) throw new NotFoundException('Patient not found');

    let clinicHistory = patient.clinicHistory;

    if (!clinicHistory) {
      clinicHistory = this.clinicHistoryRepo.create({ patient });
      clinicHistory = await this.clinicHistoryRepo.save(clinicHistory);

      patient.clinicHistory = clinicHistory;
      await this.patientsRepo.save(patient);
    }

    clinicHistory.consultations = clinicHistory.consultations ?? [];
    clinicHistory.consultations.push(consultation as any);

    await this.clinicHistoryRepo.save(clinicHistory);

    consultation.clinicHistory = clinicHistory;
    await this.consultationsRepo.save(consultation);

    return instanceToPlain(clinicHistory);
  }
}
