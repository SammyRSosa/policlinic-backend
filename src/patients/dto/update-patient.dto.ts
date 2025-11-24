import {
  IsString,
  IsOptional,
  IsEmail,
  IsDate,
} from 'class-validator';

export class UpdatePatientDto {
  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsString()
  @IsOptional()
  idNumber?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsDate()
  @IsOptional()
  dateOfBirth?: Date;
}