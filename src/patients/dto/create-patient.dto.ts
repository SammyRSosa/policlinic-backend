// src/workers/dto/create-worker.dto.ts
import {
  IsString,
  IsOptional,
  IsUUID,
  IsEmail,
  isDate,
  IS_DATE,
  IsDate,
} from 'class-validator';

export class CreatePatientDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  idNumber: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsDate()
  @IsOptional()
  dateofBirth?: Date;
}
