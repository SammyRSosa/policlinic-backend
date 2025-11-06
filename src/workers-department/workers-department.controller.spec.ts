import { Test, TestingModule } from '@nestjs/testing';
import { WorkersDepartmentController } from './workers-department.controller';

describe('WorkersDepartmentController', () => {
  let controller: WorkersDepartmentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkersDepartmentController],
    }).compile();

    controller = module.get<WorkersDepartmentController>(WorkersDepartmentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
