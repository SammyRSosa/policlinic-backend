import { Test, TestingModule } from '@nestjs/testing';
import { StockRequestsService } from './stock-requests.service';

describe('StockRequestsService', () => {
  let service: StockRequestsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StockRequestsService],
    }).compile();

    service = module.get<StockRequestsService>(StockRequestsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
