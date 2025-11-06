// src/workers/dto/create-worker.dto.ts
import { IsString, IsOptional, IsEnum, IsUUID } from 'class-validator';
import { WorkerRole } from '../worker.entity';

export class CreateWorkerDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  code: string;

  @IsEnum(WorkerRole)
  role: WorkerRole;

  @IsUUID()
  @IsOptional()
  departmentId?: string;
}
