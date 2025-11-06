import { Test, TestingModule } from '@nestjs/testing';
import { RemissionsController } from './remissions.controller';

describe('RemissionsController', () => {
  let controller: RemissionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RemissionsController],
    }).compile();

    controller = module.get<RemissionsController>(RemissionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
