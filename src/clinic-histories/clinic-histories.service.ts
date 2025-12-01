import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClinicHistory } from './clinic-history.entity';
import { Patient } from 'src/patients/patient.entity';
import { User, UserRole } from 'src/users/user.entity';
import { Consultation } from 'src/consultations/consultation.entity';

@Injectable()
export class ClinicHistoryService {
  constructor(
    @InjectRepository(ClinicHistory)
    private historyRepo: Repository<ClinicHistory>,
    @InjectRepository(Patient)
    private patientsRepo: Repository<Patient>,
    @InjectRepository(User)
    private usersRepo: Repository<User>,
    @InjectRepository(Consultation)
    private consultationsRepo: Repository<Consultation>,
  ) {}

  async create(patientId: string, notes?: string) {
    const patient = await this.patientsRepo.findOne({ where: { id: patientId } });
    if (!patient) throw new NotFoundException('Patient not found');

    // Check if patient already has a clinic history
    let history = await this.historyRepo.findOne({
      where: { patient: { id: patientId } },
      relations: ['patient', 'consultations'],
    });

    // If not, create one
    if (!history) {
      history = this.historyRepo.create({ patient, notes });
      history = await this.historyRepo.save(history);
    } else if (notes) {
      // Update notes if provided
      history.notes = notes;
      history = await this.historyRepo.save(history);
    }

    return history;
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

    // Patients can only access their own clinic history
    if (user.role === UserRole.PATIENT && user.id !== patientId) {
      throw new ForbiddenException('You can only view your own clinic history');
    }

    let history = await this.historyRepo.findOne({
      where: { patient: { id: patientId } },
      relations: ['patient', 'consultations'],
    });

    // Auto-create clinic history if it doesn't exist
    if (!history) {
      history = await this.create(patientId);
    }

    return history;
  }

  /**
 * Ensure the patient has a clinic history and append the consultation to it.
 * Returns the clinicHistory entity (after saving).
 */
private async attachConsultationToPatientHistory(patientId: string, consultation: Consultation) {
  // load patient with clinicHistory relation
  const patient = await this.patientsRepo.findOne({
    where: { id: patientId },
    relations: ['clinicHistory'],
  });
  if (!patient) throw new NotFoundException('Patient not found');

  let clinicHistory = patient.clinicHistory;
  if (!clinicHistory) {
    clinicHistory = this.historyRepo.create({ patient });
    await this.historyRepo.save(clinicHistory);

    // link back to patient (optional but keeps DB consistent)
    patient.clinicHistory = clinicHistory;
    await this.patientsRepo.save(patient);
  }

  // Ensure consultations array exists, append, and save
  clinicHistory.consultations = clinicHistory.consultations ?? [];
  clinicHistory.consultations.push(consultation as any); // type cast for TS compatibility

  await this.historyRepo.save(clinicHistory);

  // also set consultation.clinicHistory (so returned object is consistent)
  consultation.clinicHistory = clinicHistory;
  await this.consultationsRepo.save(consultation);

  return clinicHistory;
}


  async getMyClinicHistory(userId: string) {
    const user = await this.usersRepo.findOne({
      where: { id: userId },
      relations: ['patient'],
    });
    if (!user || !user.patient) throw new NotFoundException('Patient not found');

    let history = await this.historyRepo.findOne({
      where: { patient: { id: user.patient.id } },
      relations: ['patient', 'consultations'],
    });

    // Auto-create clinic history if it doesn't exist
    if (!history) {
      history = await this.create(user.patient.id);
    }

    return history;
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
