import { Test, TestingModule } from '@nestjs/testing';
import { WorkersDepartmentService } from './workers-department.service';

describe('WorkersDepartmentService', () => {
  let service: WorkersDepartmentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WorkersDepartmentService],
    }).compile();

    service = module.get<WorkersDepartmentService>(WorkersDepartmentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
