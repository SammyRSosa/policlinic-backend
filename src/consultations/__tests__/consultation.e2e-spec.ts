import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../app.module';
import { DataSource, Repository } from 'typeorm';

import { Worker, WorkerRole } from '../../workers/worker.entity';
import { Department } from '../../departments/department.entity';
import { Patient } from '../../patients/patient.entity';
import {
  Consultation,
  ConsultationStatus,
} from '../consultation.entity';

/**
 * Pruebas E2E del módulo de Consultations
 * - Usa BD de prueba (NODE_ENV=test)
 * - Limpia la BD antes de cada test
 * - Verifica endpoints de lectura y mutación básicos
 */
describe('Consultations e2e (BD de prueba, limpio y reproducible)', () => {
  let app: INestApplication;
  let httpServer: any;
  let dataSource: DataSource;

  // Repositorios para preparar datos directamente en BD
  let workerRepo: Repository<Worker>;
  let departmentRepo: Repository<Department>;
  let patientRepo: Repository<Patient>;
  let consultationRepo: Repository<Consultation>;

  // Entidades comunes a todos los tests
  let department: Department;
  let doctor: Worker;
  let patient: Patient;
  let token: string;

  // ==========================
  // Helper auth
  // ==========================
  /**
   * Registra un usuario y devuelve un JWT válido
   * Se usa para autenticar las peticiones protegidas
   */
  const registerAndLogin = async (code: string) => {
    await request(httpServer)
      .post('/auth/register')
      .send({ account: code, password: '123456' });

    const res = await request(httpServer)
      .post('/auth/login')
      .send({ account: code, password: '123456' });

    return res.body.access_token;
  };

  // ==========================
  // beforeAll
  // ==========================
  /**
   * Inicializa la aplicación Nest completa
   * Se ejecuta UNA sola vez antes de todos los tests
   */
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule], // se carga la app real
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    httpServer = app.getHttpServer();
    dataSource = moduleFixture.get(DataSource);

    // Inicializamos repositorios reales
    workerRepo = dataSource.getRepository(Worker);
    departmentRepo = dataSource.getRepository(Department);
    patientRepo = dataSource.getRepository(Patient);
    consultationRepo = dataSource.getRepository(Consultation);
  });

  // ==========================
  // beforeEach (BD limpia)
  // ==========================
  /**
   * Limpia completamente la BD antes de cada test
   * Garantiza tests aislados y reproducibles
   */
  beforeEach(async () => {
    await dataSource.query(`
      TRUNCATE
        consultations,
        patients,
        workers,
        departments,
        users
      RESTART IDENTITY CASCADE
    `);

    // Departamento base
    department = await departmentRepo.save(
      departmentRepo.create({ name: 'E2E Department' }),
    );

    // Doctor autenticado
    doctor = await workerRepo.save(
      workerRepo.create({
        code: 'DOC_E2E',
        firstName: 'Gregory',
        lastName: 'House',
        role: WorkerRole.DOCTOR,
        department,
        active: true,
      }),
    );

    // Paciente base
    patient = await patientRepo.save(
      patientRepo.create({
        firstName: 'John',
        lastName: 'Doe',
        idNumber: '123456789',
      }),
    );

    // Token JWT para las peticiones protegidas
    token = await registerAndLogin('DOC_E2E');
  });

  // ==========================
  // afterAll
  // ==========================
  /**
   * Cierra conexiones y app al finalizar todos los tests
   */
  afterAll(async () => {
    await dataSource.destroy();
    await app.close();
  });

  // ==========================
  // TEST 1: GET by worker
  // ==========================
  /**
   * Verifica que el endpoint:
   * GET /consultations/by-worker/:id
   *
   * - Responde 200
   * - Devuelve un array (aunque esté vacío)
   * - No rompe sin consultas previas
   */
  it('GET /consultations/by-worker/:id', async () => {
    const res = await request(httpServer)
      .get(`/consultations/by-worker/${doctor.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
  });

  // ==========================
  // TEST 2: GET by department
  // ==========================
  /**
   * Verifica que el endpoint:
   * GET /consultations/by-department/:id
   *
   * - Responde 200
   * - Devuelve un array de consultas del departamento
   */
  it('GET /consultations/by-department/:id', async () => {
    const res = await request(httpServer)
      .get(`/consultations/by-department/${department.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
  });

  // ==========================
  // TEST 3: PATCH status
  // ==========================
  /**
   * Verifica que:
   * - Se puede actualizar el estado de una consulta
   * - El cambio se refleja en la respuesta
   */
  it('PATCH /consultations/:id/status', async () => {
    const consultation = await consultationRepo.save(
      consultationRepo.create({
        mainDoctor: doctor,
        Doctor: doctor,
        department,
        status: ConsultationStatus.PENDING,
      }),
    );

    const res = await request(httpServer)
      .patch(`/consultations/${consultation.id}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: ConsultationStatus.CLOSED })
      .expect(200);

    expect(res.body.status).toBe(ConsultationStatus.CLOSED);
  });

  // ==========================
  // TEST 4: DELETE
  // ==========================
  /**
   * Verifica que:
   * - Se puede eliminar una consulta
   * - La consulta ya no existe en BD tras el DELETE
   */
  it('DELETE /consultations/:id', async () => {
    const consultation = await consultationRepo.save(
      consultationRepo.create({
        mainDoctor: doctor,
        Doctor: doctor,
        department,
      }),
    );

    await request(httpServer)
      .delete(`/consultations/${consultation.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const found = await consultationRepo.findOne({
      where: { id: consultation.id },
    });

    expect(found).toBeNull();
  });
});
