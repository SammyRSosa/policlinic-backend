import { Test, TestingModule } from '@nestjs/testing';
import { DepartmentStocksController } from './department-stocks.controller';

describe('DepartmentStocksController', () => {
  let controller: DepartmentStocksController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DepartmentStocksController],
    }).compile();

    controller = module.get<DepartmentStocksController>(DepartmentStocksController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
