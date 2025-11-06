import { Test, TestingModule } from '@nestjs/testing';
import { MedicationDeliveriesService } from './medication-deliveries.service';

describe('MedicationDeliveriesService', () => {
  let service: MedicationDeliveriesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MedicationDeliveriesService],
    }).compile();

    service = module.get<MedicationDeliveriesService>(MedicationDeliveriesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
