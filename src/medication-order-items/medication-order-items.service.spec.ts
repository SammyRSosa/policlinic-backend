import { Test, TestingModule } from '@nestjs/testing';
import { MedicationOrderItemsService } from './medication-order-items.service';

describe('MedicationOrderItemsService', () => {
  let service: MedicationOrderItemsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MedicationOrderItemsService],
    }).compile();

    service = module.get<MedicationOrderItemsService>(MedicationOrderItemsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
