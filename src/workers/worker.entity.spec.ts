import { Worker, WorkerRole } from './worker.entity';

describe('Worker Entity', () => {
  it('should create a worker instance', () => {
    const worker = new Worker();

    worker.firstName = 'Juan';
    worker.lastName = 'Perez';
    worker.role = WorkerRole.DOCTOR;
    worker.active = true;

    expect(worker).toBeDefined();
    expect(worker.firstName).toBe('Juan');
    expect(worker.role).toBe(WorkerRole.DOCTOR);
    expect(worker.active).toBe(true);
  });
});
