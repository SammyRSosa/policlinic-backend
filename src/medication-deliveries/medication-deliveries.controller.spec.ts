import { Test, TestingModule } from '@nestjs/testing';
import { MedicationDeliveriesController } from './medication-deliveries.controller';

describe('MedicationDeliveriesController', () => {
  let controller: MedicationDeliveriesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MedicationDeliveriesController],
    }).compile();

    controller = module.get<MedicationDeliveriesController>(MedicationDeliveriesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
