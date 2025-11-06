import { Test, TestingModule } from '@nestjs/testing';
import { HeadsOfDepartmentsController } from './heads-of-departments.controller';

describe('HeadsOfDepartmentsController', () => {
  let controller: HeadsOfDepartmentsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HeadsOfDepartmentsController],
    }).compile();

    controller = module.get<HeadsOfDepartmentsController>(HeadsOfDepartmentsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
