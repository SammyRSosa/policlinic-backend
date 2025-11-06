import { Test, TestingModule } from '@nestjs/testing';
import { DepartmentStocksService } from './department-stocks.service';

describe('DepartmentStocksService', () => {
  let service: DepartmentStocksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DepartmentStocksService],
    }).compile();

    service = module.get<DepartmentStocksService>(DepartmentStocksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
