import { Test, TestingModule } from '@nestjs/testing';
import { ConsultationsPrescriptionsService } from './consultations-prescriptions.service';

describe('ConsultationsPrescriptionsService', () => {
  let service: ConsultationsPrescriptionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConsultationsPrescriptionsService],
    }).compile();

    service = module.get<ConsultationsPrescriptionsService>(ConsultationsPrescriptionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
