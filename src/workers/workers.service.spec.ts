import { Test, TestingModule } from '@nestjs/testing';
import { WorkersService } from './workers.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Worker } from './worker.entity';
import { Department } from '../departments/department.entity';
import { WorkerDepartment } from '../workers-department/worker-department.entity';
import { HeadOfDepartment } from '../heads-of-departments/head-of-department.entity';
import { Repository } from 'typeorm';
import { WorkerRole } from './worker.entity';
import { UserRole } from '../users/user.entity';
import { EntityManager } from 'typeorm';

describe('WorkersService', () => {
  let service: WorkersService;
  let workersRepo: Repository<Worker>;
  let departmentsRepo: Repository<Department>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkersService,
        {
          provide: getRepositoryToken(Worker),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            save: jest.fn(),
            create: jest.fn(),
            manager: {
              transaction: jest.fn(),
            },
          },
        },
        {
          provide: getRepositoryToken(Department),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(WorkerDepartment),
          useValue: {
            find: jest.fn(),
            save: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(HeadOfDepartment),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<WorkersService>(WorkersService);
    workersRepo = module.get(getRepositoryToken(Worker));
    departmentsRepo = module.get(getRepositoryToken(Department));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('ADMIN can create worker', async () => {
    const dto = {
      firstName: 'Juan',
      lastName: 'Perez',
      role: WorkerRole.DOCTOR,
      departmentId: 'dep-1',
    };

    const creator = { id: 'admin-1', role: UserRole.ADMIN };

    workersRepo.manager.transaction = jest.fn(); // opcional, inicializamos
    const fakeEm = {
      getRepository: jest.fn().mockReturnValue({
        create: jest.fn().mockReturnValue(dto),
        save: jest.fn().mockResolvedValue({ id: 'worker-1' }),
      }),
    } as unknown as EntityManager;

    (workersRepo.manager.transaction as jest.Mock).mockImplementation(
      async (runInTransaction: (em: EntityManager) => any) => {
        return runInTransaction(fakeEm);
      },
    );


    const result = await service.create(dto as any, creator as any);
    expect(result).toBeDefined();
  });

  it('HEAD_OF_DEPARTMENT cannot create ADMIN', async () => {
    const dto = {
      firstName: 'Ana',
      lastName: 'Lopez',
      role: WorkerRole.ADMIN,
    };

    const creator = {
      id: 'head-1',
      role: UserRole.HEAD_OF_DEPARTMENT,
    };

    await expect(service.create(dto as any, creator as any))
      .rejects
      .toThrow();
  });
});
