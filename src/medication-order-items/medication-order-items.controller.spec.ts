import { Test, TestingModule } from '@nestjs/testing';
import { MedicationOrderItemsController } from './medication-order-items.controller';

describe('MedicationOrderItemsController', () => {
  let controller: MedicationOrderItemsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MedicationOrderItemsController],
    }).compile();

    controller = module.get<MedicationOrderItemsController>(MedicationOrderItemsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
