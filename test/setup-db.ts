// test/setup-db.ts
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

// Cargar variables de entorno de prueba
dotenv.config({ path: '.env.test' });

import { User, UserRole } from '../src/users/user.entity';
import { Patient } from '../src/patients/patient.entity';
import { Medication } from '../src/medications/medication.entity';
import { Worker } from '../src/workers/worker.entity';
import * as bcrypt from 'bcrypt';

export async function setupTestApp(): Promise<INestApplication> {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleRef.createNestApplication();
  await app.init();

  const isTestEnv = process.env.NODE_ENV === 'test';

  if (isTestEnv) {
    console.log('🧪 Test environment detected, seeding database...');

    const userRepo = moduleRef.get(getRepositoryToken(User));
    const patientRepo = moduleRef.get(getRepositoryToken(Patient));
    const medicationRepo = moduleRef.get(getRepositoryToken(Medication));
    const workerRepo = moduleRef.get(getRepositoryToken(Worker));

    // Limpia todas las tablas
    const dataSource = moduleRef.get(DataSource);
    await dataSource.synchronize(true);

    // =========================
    // 🔐 Seed SUPER ADMIN
    // =========================
    const hashedPassword = await bcrypt.hash('superadmin123', 10);
    const superAdmin = userRepo.create({
      username: 'superadmin',
      password: hashedPassword,
      role: UserRole.ADMIN,
    });
    await userRepo.save(superAdmin);

    // =========================
    // 👨‍⚕️ Seed Patients
    // =========================
    const firstNames = ['Juan', 'Ana', 'Luis', 'Maria', 'Pedro', 'Lucia', 'Miguel', 'Sofia'];
    const lastNames = ['Gomez', 'Perez', 'Rodriguez', 'Fernandez', 'Martinez'];

    const randomDateOfBirth = () => {
      const start = new Date(1950, 0, 1).getTime();
      const end = new Date(2018, 0, 1).getTime();
      return new Date(start + Math.random() * (end - start));
    };

    for (let i = 1; i <= 10; i++) { // puedes aumentar la cantidad
      const patient = patientRepo.create({
        firstName: firstNames[i % firstNames.length],
        lastName: lastNames[i % lastNames.length],
        idNumber: `P-${String(i).padStart(4, '0')}`,
        email: `patient${i}@demo.local`,
        phone: `555-10${String(i).padStart(2, '0')}`,
        dateOfBirth: randomDateOfBirth(),
      });
      await patientRepo.save(patient);
    }

    // =========================
    // 💊 Seed Medications
    // =========================
    const medications = [
      { name: 'Paracetamol', code: 'MED-001', unit: 'tablet', description: 'Pain reliever' },
      { name: 'Ibuprofen', code: 'MED-002', unit: 'tablet', description: 'Anti-inflammatory' },
    ];

    for (const med of medications) {
      const medication = medicationRepo.create(med);
      await medicationRepo.save(medication);
    }

    // =========================
    // 👨‍⚕️ Seed Workers
    // =========================
    const createWorkers = async (role: 'doctor' | 'nurse' | 'staff', count: number) => {
      const prefixMap = { doctor: 'DOC', nurse: 'NUR', staff: 'STA' };
      for (let i = 1; i <= count; i++) {
        const worker = workerRepo.create({
          code: `${prefixMap[role]}-${String(i).padStart(3, '0')}`,
          firstName: firstNames[i % firstNames.length],
          lastName: lastNames[i % lastNames.length],
          role,
          active: true,
        });
        await workerRepo.save(worker);
      }
    };

    await createWorkers('doctor', 5);
    await createWorkers('nurse', 5);
    await createWorkers('staff', 5);

    console.log('✅ Test database seeded');
  }

  return app;
}
