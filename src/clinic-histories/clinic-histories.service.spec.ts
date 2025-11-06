import { Test, TestingModule } from '@nestjs/testing';
import { ClinicHistoriesService } from './clinic-histories.service';

describe('ClinicHistoriesService', () => {
  let service: ClinicHistoriesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ClinicHistoriesService],
    }).compile();

    service = module.get<ClinicHistoriesService>(ClinicHistoriesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
