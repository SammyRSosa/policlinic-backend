import { Test } from '@nestjs/testing';
import { WorkersModule } from './workers.module';

describe('WorkersModule', () => {
  it('should compile the module', async () => {
    const module = await Test.createTestingModule({
      imports: [WorkersModule],
    }).compile();

    expect(module).toBeDefined();
  });
});
