import { Test, TestingModule } from '@nestjs/testing';
import { ClinicHistoriesController } from './clinic-histories.controller';

describe('ClinicHistoriesController', () => {
  let controller: ClinicHistoriesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClinicHistoriesController],
    }).compile();

    controller = module.get<ClinicHistoriesController>(ClinicHistoriesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
