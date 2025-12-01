import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from 'src/users/user.entity';
import { Worker, WorkerRole } from 'src/workers/worker.entity';
import { Patient } from 'src/patients/patient.entity';
import { Department } from 'src/departments/department.entity';
import { HeadOfDepartment } from 'src/heads-of-departments/head-of-department.entity';

@Injectable()
export class SeedService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Worker) private workerRepo: Repository<Worker>,
    @InjectRepository(Patient) private patientRepo: Repository<Patient>,
    @InjectRepository(Department) private departmentRepo: Repository<Department>,
    @InjectRepository(HeadOfDepartment) private headRepo: Repository<HeadOfDepartment>,
  ) {}

  async seed() {
    console.log('🌱 Starting database seed...');

    // 1️⃣ Create Departments & Heads
    console.log('📋 Creating departments...');
    const departments = await this.createDepartments();

    // 2️⃣ Create Workers
    console.log('👨‍⚕️ Creating workers...');
    const workers = await this.createWorkers(departments);

    // 3️⃣ Create Patients
    console.log('🧑‍🤝‍🧑 Creating patients...');
    const patients = await this.createPatients();

    // 4️⃣ Create Users (Auth)
    console.log('🔑 Creating users...');
    await this.createUsers(workers, patients);

    console.log('✅ Seed completed successfully!');
    console.log('\n📚 Test Credentials:');
    console.log('---');
    console.log('ADMIN: admin / admin123');
    console.log('HEAD: doc001 / password123');
    console.log('DOCTOR: doc002 / password123');
    console.log('NURSE: nurse001 / password123');
    console.log('PATIENT: 12345678 / password123');
  }

  private async createDepartments(): Promise<Department[]> {
    const departmentNames = [
      'Cardiología',
      'Neurología',
      'Pediatría',
      'Oncología',
      'Cirugía General',
      'Radiología',
      'Laboratorio',
      'Emergencias',
    ];

    const departments: Department[] = [];

    for (const name of departmentNames) {
      const existing = await this.departmentRepo.findOne({ where: { name } });
      if (!existing) {
        const dept = this.departmentRepo.create({ name });
        const saved = await this.departmentRepo.save(dept);
        departments.push(saved);
        console.log(`  ✓ ${name}`);
      } else {
        departments.push(existing);
      }
    }

    return departments;
  }

  private async createWorkers(departments: Department[]): Promise<Worker[]> {
    const workers: Worker[] = [];

    // 1️⃣ ADMIN
    const adminExists = await this.workerRepo.findOne({
      where: { code: 'admin' },
    });
    if (!adminExists) {
      const admin = this.workerRepo.create({
        code: 'admin',
        firstName: 'Admin',
        lastName: 'System',
        email: 'admin@hospital.com',
        role: WorkerRole.ADMIN,
        active: true,
      });
      const saved = await this.workerRepo.save(admin);
      workers.push(saved);
      console.log(`  ✓ Admin (admin)`);
    } else {
      workers.push(adminExists);
    }

    // 2️⃣ HEAD OF DEPARTMENTS (1 per department)
    for (let i = 0; i < Math.min(3, departments.length); i++) {
      const code = `head${i + 1}`;
      const existing = await this.workerRepo.findOne({ where: { code } });
      if (!existing) {
        const head = this.workerRepo.create({
          code,
          firstName: `Jefe`,
          lastName: `Departamento ${i + 1}`,
          email: `head${i + 1}@hospital.com`,
          role: WorkerRole.HEAD_OF_DEPARTMENT,
          department: departments[i],
          active: true,
        });
        const saved = await this.workerRepo.save(head);
        workers.push(saved);
        console.log(`  ✓ Head of Department: ${head.firstName} ${head.lastName}`);
      } else {
        workers.push(existing);
      }
    }

    // 3️⃣ DOCTORS (multiple per department)
    for (let d = 0; d < departments.length; d++) {
      for (let i = 0; i < 3; i++) {
        const code = `doc${d}${i}`;
        const existing = await this.workerRepo.findOne({ where: { code } });
        if (!existing) {
          const doctor = this.workerRepo.create({
            code,
            firstName: `Doctor ${d}-${i}`,
            lastName: `Especialista`,
            email: `doctor${d}${i}@hospital.com`,
            role: WorkerRole.DOCTOR,
            department: departments[d],
            active: true,
          });
          const saved = await this.workerRepo.save(doctor);
          workers.push(saved);
          console.log(`  ✓ Doctor: ${saved.firstName} ${saved.lastName}`);
        } else {
          workers.push(existing);
        }
      }
    }

    // 4️⃣ NURSES
    for (let d = 0; d < departments.length; d++) {
      for (let i = 0; i < 2; i++) {
        const code = `nurse${d}${i}`;
        const existing = await this.workerRepo.findOne({ where: { code } });
        if (!existing) {
          const nurse = this.workerRepo.create({
            code,
            firstName: `Enfermero ${d}-${i}`,
            lastName: `Hospitalario`,
            email: `nurse${d}${i}@hospital.com`,
            role: WorkerRole.NURSE,
            department: departments[d],
            active: true,
          });
          const saved = await this.workerRepo.save(nurse);
          workers.push(saved);
          console.log(`  ✓ Nurse: ${saved.firstName} ${saved.lastName}`);
        } else {
          workers.push(existing);
        }
      }
    }

    // 5️⃣ STAFF
    for (let i = 0; i < 5; i++) {
      const code = `staff${i}`;
      const existing = await this.workerRepo.findOne({ where: { code } });
      if (!existing) {
        const staff = this.workerRepo.create({
          code,
          firstName: `Personal ${i}`,
          lastName: `Administrativo`,
          email: `staff${i}@hospital.com`,
          role: WorkerRole.STAFF,
          department: departments[0],
          active: true,
        });
        const saved = await this.workerRepo.save(staff);
        workers.push(saved);
        console.log(`  ✓ Staff: ${saved.firstName} ${saved.lastName}`);
      } else {
        workers.push(existing);
      }
    }

    return workers;
  }

  private async createPatients(): Promise<Patient[]> {
    const patients: Patient[] = [];

    const patientData = [
      { firstName: 'Juan', lastName: 'Pérez', idNumber: '12345678', email: 'juan@email.com', phone: '555-0001' },
      { firstName: 'María', lastName: 'García', idNumber: '87654321', email: 'maria@email.com', phone: '555-0002' },
      { firstName: 'Carlos', lastName: 'López', idNumber: '11111111', email: 'carlos@email.com', phone: '555-0003' },
      { firstName: 'Ana', lastName: 'Martínez', idNumber: '22222222', email: 'ana@email.com', phone: '555-0004' },
      { firstName: 'Luis', lastName: 'Rodríguez', idNumber: '33333333', email: 'luis@email.com', phone: '555-0005' },
      { firstName: 'Sandra', lastName: 'Gómez', idNumber: '44444444', email: 'sandra@email.com', phone: '555-0006' },
      { firstName: 'Miguel', lastName: 'Hernández', idNumber: '55555555', email: 'miguel@email.com', phone: '555-0007' },
      { firstName: 'Laura', lastName: 'Díaz', idNumber: '66666666', email: 'laura@email.com', phone: '555-0008' },
      { firstName: 'Roberto', lastName: 'Fernández', idNumber: '77777777', email: 'roberto@email.com', phone: '555-0009' },
      { firstName: 'Patricia', lastName: 'Sánchez', idNumber: '88888888', email: 'patricia@email.com', phone: '555-0010' },
    ];

    for (const data of patientData) {
      const existing = await this.patientRepo.findOne({
        where: { idNumber: data.idNumber },
      });
      if (!existing) {
        const patient = this.patientRepo.create({
          ...data,
          dateOfBirth: this.getRandomBirthDate(),
        });
        const saved = await this.patientRepo.save(patient);
        patients.push(saved);
        console.log(`  ✓ Patient: ${saved.firstName} ${saved.lastName} (${saved.idNumber})`);
      } else {
        patients.push(existing);
      }
    }

    return patients;
  }

  private async createUsers(workers: Worker[], patients: Patient[]): Promise<void> {
    const hashedPassword = await bcrypt.hash('password123', 10);
    const adminPassword = await bcrypt.hash('admin123', 10);

    // Create users for workers
    for (const worker of workers) {
      const existing = await this.userRepo.findOne({
        where: { username: worker.code },
      });

      if (!existing) {
        let role: UserRole;
        switch (worker.role) {
          case WorkerRole.ADMIN:
            role = UserRole.ADMIN;
            break;
          case WorkerRole.HEAD_OF_DEPARTMENT:
            role = UserRole.HEAD_OF_DEPARTMENT;
            break;
          case WorkerRole.DOCTOR:
            role = UserRole.DOCTOR;
            break;
          default:
            role = UserRole.DOCTOR;
        }

        const user = this.userRepo.create({
          username: worker.code,
          password: worker.role === WorkerRole.ADMIN ? adminPassword : hashedPassword,
          role,
          worker,
        });

        await this.userRepo.save(user);
        console.log(`  ✓ User for Worker: ${worker.code} (${role})`);
      }
    }

    // Create users for patients
    for (const patient of patients) {
      const existing = await this.userRepo.findOne({
        where: { username: patient.idNumber },
      });

      if (!existing) {
        const user = this.userRepo.create({
          username: patient.idNumber,
          password: hashedPassword,
          role: UserRole.PATIENT,
          patient,
        });

        await this.userRepo.save(user);
        console.log(`  ✓ User for Patient: ${patient.idNumber}`);
      }
    }
  }

  private getRandomBirthDate(): Date {
    const minAge = 18;
    const maxAge = 80;
    const age = Math.floor(Math.random() * (maxAge - minAge + 1)) + minAge;
    const date = new Date();
    date.setFullYear(date.getFullYear() - age);
    return date;
  }
}