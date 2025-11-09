import { IsOptional, IsString } from 'class-validator';
import { W } from 'typeorm';
import { WorkerRole } from '../worker.entity';

export class UpdateWorkerDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  role?: WorkerRole;

  @IsOptional()
  @IsString()
  departmentId?: string | null;
}
