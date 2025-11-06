import { Test, TestingModule } from '@nestjs/testing';
import { StockRequestsController } from './stock-requests.controller';

describe('StockRequestsController', () => {
  let controller: StockRequestsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StockRequestsController],
    }).compile();

    controller = module.get<StockRequestsController>(StockRequestsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
