import { Test, TestingModule } from '@nestjs/testing';
import { MedicationOrdersController } from './medication-orders.controller';

describe('MedicationOrdersController', () => {
  let controller: MedicationOrdersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MedicationOrdersController],
    }).compile();

    controller = module.get<MedicationOrdersController>(MedicationOrdersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
