import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { DataSource } from 'typeorm';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    dataSource = moduleFixture.get(DataSource); // usar conexión ya inicializada

    console.log('✅ Test app initialized with database:', dataSource.options.database);
  });

  beforeEach(async () => {
    // Limpiar las tablas necesarias antes de cada test
    const tables = ['user', 'departments', 'workers', 'worker_departments'];
    for (const table of tables) {
      // TRUNCATE solo si la tabla existe
      await dataSource.query(`
        DO $$
        BEGIN
          IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = '${table}') THEN
            EXECUTE 'TRUNCATE "${table}" RESTART IDENTITY CASCADE';
          END IF;
        END
        $$;
      `);
    }
  });

  afterAll(async () => {
    // Cerrar conexiones
    await dataSource.destroy();
    await app.close();
    console.log('🧹 Test cleanup completed');
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  it('should have empty database on test start', async () => {
    // Evita error si la tabla no existe
    const tableExists = await dataSource.query(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables WHERE table_name = 'user'
      )
    `);

    if (tableExists[0].exists) {
      const users = await dataSource.query('SELECT COUNT(*) FROM "user"');
      expect(parseInt(users[0].count)).toBe(0);
    } else {
      console.log('⚠️ Tabla "user" aún no existe, skipping count check');
    }
  });
});
