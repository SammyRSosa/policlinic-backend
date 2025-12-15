import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../../src/app.module';
import { DataSource } from 'typeorm';
import { WorkerRole } from '../worker.entity';

describe('Workers e2e (real DB)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  let adminToken: string;
  let departmentId: string;
  let workerId: string;

  // ==========================
  // Helpers reales
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

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule], // ✅ Usa BD real
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    dataSource = moduleFixture.get(DataSource);

    // ==========================
    // 1️⃣ Crear ADMIN worker directamente en DB
    // ==========================
    const workerRepo = dataSource.getRepository('Worker');
    const adminWorker = workerRepo.create({
      firstName: 'Admin',
      lastName: 'E2E',
      code: 'ADMIN_E2E',
      role: WorkerRole.ADMIN,
    });
    await workerRepo.save(adminWorker);

    // ==========================
    // 2️⃣ Registrar usuario y obtener token
    // ==========================
    adminToken = await registerAndLogin('ADMIN_E2E');

    // ==========================
    // 3️⃣ Obtener un departmentId real
    // ==========================
    const deptRes = await dataSource.query(
      `SELECT id FROM departments LIMIT 1`,
    );
    expect(deptRes.length).toBeGreaterThan(0);
    departmentId = deptRes[0].id;
  });

  afterAll(async () => {
    await dataSource.destroy();
    await app.close();
  });

  // =====================================================
  // CREATE
  // =====================================================
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

    workerId = res.body.id; // ✅ Guardamos ID del worker creado
    expect(res.body.department.id).toBe(departmentId);
  });

  // =====================================================
  // GET BY DEPARTMENT
  // =====================================================
  it('GET /workers/department/:id - fetch workers by department', async () => {
    const res = await request(app.getHttpServer())
      .get(`/workers/department/${departmentId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    const ids = res.body.map((w) => w.id);
    expect(ids).toContain(workerId);
  });

  // =====================================================
  // SOFT DELETE
  // =====================================================
  it('DELETE /workers/:id - soft delete worker', async () => {
    await request(app.getHttpServer())
      .delete(`/workers/${workerId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
  });

  it('GET /workers - should NOT include soft deleted worker', async () => {
    const res = await request(app.getHttpServer())
      .get('/workers')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    const ids = res.body.map((w) => w.id);
    expect(ids).not.toContain(workerId);
  });

  it('GET /workers/department/:id - should NOT include soft deleted worker', async () => {
    const res = await request(app.getHttpServer())
      .get(`/workers/department/${departmentId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    const ids = res.body.map((w) => w.id);
    expect(ids).not.toContain(workerId);
  });
});
