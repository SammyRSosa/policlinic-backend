import { Test, TestingModule } from '@nestjs/testing';
import { ConsultationsPrescriptionsController } from './consultations-prescriptions.controller';

describe('ConsultationsPrescriptionsController', () => {
  let controller: ConsultationsPrescriptionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConsultationsPrescriptionsController],
    }).compile();

    controller = module.get<ConsultationsPrescriptionsController>(ConsultationsPrescriptionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
