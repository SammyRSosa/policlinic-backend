import { WorkersController } from './workers.controller';

describe('WorkersController', () => {
  let controller: WorkersController;
  let service: any;

  beforeEach(() => {
    service = {
      create: jest.fn(),
      findAll: jest.fn(),
      updateWorker: jest.fn(),
      softDeleteWorker: jest.fn(),
      getWorkersByDepartment: jest.fn(),
      findByUserId: jest.fn(),
    };

    controller = new WorkersController(service);
  });

  it('should call service.create', async () => {
    const dto = {};
    const req = { user: { id: '1' } };

    await controller.create(dto as any, req as any);

    expect(service.create).toHaveBeenCalled();
  });

  it('should call service.findAll', async () => {
    await controller.findAll({} as any);
    expect(service.findAll).toHaveBeenCalled();
  });
});
