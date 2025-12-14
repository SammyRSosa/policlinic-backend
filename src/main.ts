import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Patient } from './patients/patient.entity';
import { Medication } from './medications/medication.entity';

import { User, UserRole } from './users/user.entity';
import { Worker } from './workers/worker.entity';
import { ClassSerializerInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  /* =========================
     🔐 Seed SUPER ADMIN
     ========================= */
  const userRepo = app.get(getRepositoryToken(User));

  const existingSuperAdmin = await userRepo.findOne({
    where: { role: UserRole.ADMIN },
  });

  if (!existingSuperAdmin) {
    const hashedPassword = await bcrypt.hash('superadmin123', 10);
    const superAdmin = userRepo.create({
      username: 'superadmin',
      password: hashedPassword,
      role: UserRole.ADMIN,
    });
    await userRepo.save(superAdmin);
    console.log(
      '✅ Super admin created: username=superadmin, password=superadmin123',
    );
  } else {
    console.log('ℹ️ Super admin already exists.');
  }


  /* =========================
     👨‍⚕️ Seed Patients (ONLY IF EMPTY)
     ========================= */



  const patientRepo = app.get(getRepositoryToken(Patient));
  const patientCount = await patientRepo.count();

  if (patientCount === 0) {
    console.log('🌱 Seeding patients...');

    const firstNames = [
      'Juan', 'Ana', 'Luis', 'Maria', 'Pedro', 'Lucia', 'Miguel', 'Sofia',
      'Jorge', 'Elena', 'Daniel', 'Paula', 'Andres', 'Laura', 'Ivan', 'Carmen',
    ];

    const lastNames = [
      'Gomez', 'Perez', 'Rodriguez', 'Fernandez', 'Martinez',
      'Lopez', 'Hernandez', 'Garcia', 'Diaz', 'Morales',
    ];

    const randomDateOfBirth = () => {
      const start = new Date(1950, 0, 1).getTime();
      const end = new Date(2018, 0, 1).getTime();
      return new Date(start + Math.random() * (end - start));
    };

    for (let i = 1; i <= 50; i++) {
      const firstName = firstNames[i % firstNames.length];
      const lastName = lastNames[i % lastNames.length];

      const patient = patientRepo.create({
        firstName,
        lastName,
        idNumber: `P-${String(i).padStart(4, '0')}`, // ✅ REQUIRED
        email: `patient${i}@demo.local`,
        phone: `555-10${String(i).padStart(2, '0')}`,
        dateOfBirth: randomDateOfBirth(),
      });

      await patientRepo.save(patient);
      console.log(
        `✔ patient [${patient.idNumber}]: ${firstName} ${lastName}`,
      );
    }

    console.log('✅ Patients seeded');
  } else {
    console.log(`ℹ️ Patients already exist (${patientCount}), skipping seeding.`);
  }


  /* =========================
   💊 Seed MEDICATIONS (ONLY IF EMPTY)
   ========================= */
  const medicationRepo = app.get(getRepositoryToken(Medication));
  const medicationCount = await medicationRepo.count();

  if (medicationCount === 0) {
    console.log('🌱 Seeding medications...');

    const medications = [
      { name: 'Paracetamol', code: 'MED-001', unit: 'tablet', description: 'Pain reliever' },
      { name: 'Ibuprofen', code: 'MED-002', unit: 'tablet', description: 'Anti-inflammatory' },
      { name: 'Amoxicillin', code: 'MED-003', unit: 'capsule', description: 'Antibiotic' },
      { name: 'Azithromycin', code: 'MED-004', unit: 'tablet', description: 'Antibiotic' },
      { name: 'Aspirin', code: 'MED-005', unit: 'tablet', description: 'Analgesic' },
      { name: 'Omeprazole', code: 'MED-006', unit: 'capsule', description: 'Gastric protector' },
      { name: 'Metformin', code: 'MED-007', unit: 'tablet', description: 'Antidiabetic' },
      { name: 'Insulin', code: 'MED-008', unit: 'IU', description: 'Hormone therapy' },
      { name: 'Salbutamol', code: 'MED-009', unit: 'ml', description: 'Bronchodilator' },
      { name: 'Losartan', code: 'MED-010', unit: 'tablet', description: 'Antihypertensive' },

      { name: 'Enalapril', code: 'MED-011', unit: 'tablet', description: 'Blood pressure control' },
      { name: 'Atorvastatin', code: 'MED-012', unit: 'tablet', description: 'Cholesterol reducer' },
      { name: 'Furosemide', code: 'MED-013', unit: 'tablet', description: 'Diuretic' },
      { name: 'Ceftriaxone', code: 'MED-014', unit: 'vial', description: 'Injectable antibiotic' },
      { name: 'Diclofenac', code: 'MED-015', unit: 'tablet', description: 'Anti-inflammatory' },
      { name: 'Hydrocortisone', code: 'MED-016', unit: 'vial', description: 'Steroid' },
      { name: 'Ranitidine', code: 'MED-017', unit: 'tablet', description: 'Acid reducer' },
      { name: 'Vitamin C', code: 'MED-018', unit: 'tablet', description: 'Supplement' },
      { name: 'Calcium Carbonate', code: 'MED-019', unit: 'tablet', description: 'Supplement' },
      { name: 'Zinc Sulfate', code: 'MED-020', unit: 'tablet', description: 'Supplement' },
    ];

    for (const med of medications) {
      const exists = await medicationRepo.findOne({
        where: { name: med.name },
      });

      if (!exists) {
        const medication = medicationRepo.create(med);
        await medicationRepo.save(medication);
        console.log(`✔ Medication created: ${med.name}`);
      } else {
        console.log(`ℹ️ Medication '${med.name}' already exists, skipped.`);
      }
    }

    console.log('✅ Medications seeded');
  } else {
    console.log(
      `ℹ️ Medications already exist (${medicationCount}), skipping seeding.`,
    );
  }

  /* =========================
     👨‍⚕️ Seed WORKERS (ONLY IF EMPTY)
     ========================= */
  const workerRepo = app.get(getRepositoryToken(Worker));
  const workerCount = await workerRepo.count();

  if (workerCount === 0) {
    console.log('🌱 Seeding workers...');

    const firstNames = [
      'Carlos', 'Ana', 'Luis', 'Maria', 'Pedro', 'Lucia', 'Miguel', 'Sofia',
      'Jorge', 'Elena', 'Daniel', 'Paula', 'Andres', 'Laura', 'Ivan', 'Carmen',
    ];

    const lastNames = [
      'Gomez', 'Perez', 'Rodriguez', 'Fernandez', 'Martinez',
      'Lopez', 'Hernandez', 'Garcia', 'Diaz', 'Morales', 'Sosa',
    ];

    const createWorkers = async (
      role: 'doctor' | 'nurse' | 'staff',
      count: number,
    ) => {
      const rolePrefixMap = {
        doctor: 'DOC',
        nurse: 'NUR',
        staff: 'STA',
      };

      const prefix = rolePrefixMap[role];

      for (let i = 1; i <= count; i++) {
        const firstName = firstNames[i % firstNames.length];
        const lastName = `${lastNames[i % lastNames.length]} ${role.toUpperCase()}-${i}`;

        const code = `${prefix}-${String(i).padStart(3, '0')}`;

        const worker = workerRepo.create({
          code,              // ✅ REQUIRED
          firstName,
          lastName,
          role,
          active: true,      // por si acaso
        });

        await workerRepo.save(worker);
        console.log(`✔ ${role} [${code}]: ${firstName} ${lastName}`);
      }
    };

    await createWorkers('doctor', 20);
    await createWorkers('nurse', 50);
    await createWorkers('staff', 50);

    console.log('✅ Workers seeded');
  } else {
    console.log(`ℹ️ Workers already exist (${workerCount}), skipping seeding.`);
  }

  /* =========================
     🌐 APP CONFIG
     ========================= */
  app.enableCors({
    origin: 'http://localhost:3001',
    credentials: true,
  });


  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get(Reflector)),
  );

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`🚀 Application running on: http://localhost:${port}`);
}

bootstrap();
