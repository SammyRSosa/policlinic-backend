import { Test, TestingModule } from '@nestjs/testing';
import { StocksItemsService } from '../stock-items/stocks-items.service';

describe('StocksItemsService', () => {
  let service: StocksItemsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StocksItemsService],
    }).compile();

    service = module.get<StocksItemsService>(StocksItemsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
