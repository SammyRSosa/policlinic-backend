// src/workers/dto/create-worker.dto.ts
import { IsString, IsOptional, IsUUID, IsDate } from 'class-validator';

export class CreateRemissionDto {
  @IsUUID()
  patientId: string;

  @IsUUID()
  toDepartment: string;

  @IsUUID()
  @IsOptional()
  fromDepartment?: string;

  @IsDate()
  date: Date;

  @IsString()
  @IsOptional()
  fromPost?: string;
}
