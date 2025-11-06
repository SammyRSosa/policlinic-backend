import { Test, TestingModule } from '@nestjs/testing';
import { HeadsOfDepartmentsService } from './heads-of-departments.service';

describe('HeadsOfDepartmentsService', () => {
  let service: HeadsOfDepartmentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HeadsOfDepartmentsService],
    }).compile();

    service = module.get<HeadsOfDepartmentsService>(HeadsOfDepartmentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
