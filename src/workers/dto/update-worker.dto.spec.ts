import { validate } from 'class-validator';
import { UpdateWorkerDto } from './update-worker.dto';

describe('UpdateWorkerDto', () => {
  it('should allow empty dto', async () => {
    const dto = new UpdateWorkerDto();
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should accept firstName', async () => {
    const dto = new UpdateWorkerDto();
    dto.firstName = 'Carlos';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });
});
