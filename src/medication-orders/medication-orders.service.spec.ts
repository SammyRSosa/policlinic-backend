import { Test, TestingModule } from '@nestjs/testing';
import { MedicationOrdersService } from './medication-orders.service';

describe('MedicationOrdersService', () => {
  let service: MedicationOrdersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MedicationOrdersService],
    }).compile();

    service = module.get<MedicationOrdersService>(MedicationOrdersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
