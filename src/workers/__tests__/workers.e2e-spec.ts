import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../../src/app.module';
import { DataSource } from 'typeorm';
import { WorkerRole } from '../worker.entity';

describe('Workers e2e (BD de prueba, limpio y reproducible)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  let adminToken: string;
  let departmentId: string;

  // ==========================
  // Helper: Registrar y loguear usuario
  // ==========================
  const registerAndLogin = async (code: string) => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ account: code, password: '123456' });

    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ account: code, password: '123456' });

    return res.body.access_token;
  };

  // ==========================
  // Inicialización antes de todos los tests
  // ==========================
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    dataSource = moduleFixture.get(DataSource); // usar la conexión existente
    // NO llamar a dataSource.initialize()
  });


  // ==========================
  // Antes de cada test
  // ==========================
  beforeEach(async () => {
    // Limpiar tablas necesarias
    await dataSource.query(`
      TRUNCATE 
        workers,
        departments,
        worker_departments,
        users
      RESTART IDENTITY CASCADE
    `);

    // Crear un departamento mínimo para los tests
    const deptRes = await dataSource.query(
      `INSERT INTO departments (name) VALUES ('E2E Department') RETURNING id`
    );
    departmentId = deptRes[0].id;

    // Crear admin worker mínimo
    const workerRepo = dataSource.getRepository('Worker');
    const adminWorker = workerRepo.create({
      firstName: 'Admin',
      lastName: 'E2E',
      code: 'ADMIN_E2E',
      role: WorkerRole.ADMIN,
      department: { id: departmentId },
    });
    await workerRepo.save(adminWorker);

    // Registrar y loguear admin para obtener token
    adminToken = await registerAndLogin('ADMIN_E2E');
  });

  // ==========================
  // Limpiar después de todos los tests
  // ==========================
  afterAll(async () => {
    await dataSource.destroy();
    await app.close();
  });

  // ==========================
  // TEST 1: Crear worker con departamento
  // ==========================
  it('POST /workers - create worker with department', async () => {
    const res = await request(app.getHttpServer())
      .post('/workers')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        firstName: 'Doctor',
        lastName: 'Dept',
        code: 'DOC_E2E_1',
        role: WorkerRole.DOCTOR,
        departmentId,
      })
      .expect(201);

    expect(res.body.department.id).toBe(departmentId);
  });

  // ==========================
  // TEST 2: Obtener workers por departamento
  // ==========================
  it('GET /workers/department/:id - fetch workers by department', async () => {
    // Crear worker para el test
    const resCreate = await request(app.getHttpServer())
      .post('/workers')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        firstName: 'Doctor',
        lastName: 'Dept',
        code: 'DOC_E2E_2',
        role: WorkerRole.DOCTOR,
        departmentId,
      })
      .expect(201);

    const workerIdLocal = resCreate.body.id;

    // GET workers por departamento
    const res = await request(app.getHttpServer())
      .get(`/workers/department/${departmentId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    const ids = res.body.map((w) => w.id);
    expect(ids).toContain(workerIdLocal);
  });

  // ==========================
  // TEST 3: Soft delete
  // ==========================
  it('DELETE /workers/:id - soft delete worker', async () => {
    // Crear worker para eliminar
    const resCreate = await request(app.getHttpServer())
      .post('/workers')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        firstName: 'Temp',
        lastName: 'Delete',
        code: 'DEL_E2E',
        role: WorkerRole.DOCTOR,
        departmentId,
      })
      .expect(201);

    const workerIdLocal = resCreate.body.id;

    // Soft delete
    await request(app.getHttpServer())
      .delete(`/workers/${workerIdLocal}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    // Verificar que no aparezca en GET /workers
    const resAll = await request(app.getHttpServer())
      .get('/workers')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    const idsAll = resAll.body.map((w) => w.id);
    expect(idsAll).not.toContain(workerIdLocal);

    // Verificar que no aparezca en GET por departamento
    const resDept = await request(app.getHttpServer())
      .get(`/workers/department/${departmentId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    const idsDept = resDept.body.map((w) => w.id);
    expect(idsDept).not.toContain(workerIdLocal);
  });
});
