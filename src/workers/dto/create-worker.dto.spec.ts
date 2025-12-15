import { validate } from 'class-validator';
import { CreateWorkerDto } from './create-worker.dto';
import { WorkerRole } from '../worker.entity';

describe('CreateWorkerDto', () => {
  it('should validate a correct dto', async () => {
    const dto = new CreateWorkerDto();
    dto.firstName = 'Ana';
    dto.lastName = 'Lopez';
    dto.role = WorkerRole.NURSE;

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail if firstName is missing', async () => {
    const dto = new CreateWorkerDto();
    dto.lastName = 'Lopez';
    dto.role = WorkerRole.NURSE;

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });
});
