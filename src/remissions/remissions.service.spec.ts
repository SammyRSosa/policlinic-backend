import { Test, TestingModule } from '@nestjs/testing';
import { RemissionsService } from './remissions.service';

describe('RemissionsService', () => {
  let service: RemissionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RemissionsService],
    }).compile();

    service = module.get<RemissionsService>(RemissionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
