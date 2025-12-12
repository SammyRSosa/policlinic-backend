import { IsUUID, IsOptional, IsString } from 'class-validator';

export class CreateClinicHistoryDto {
  @IsUUID()
  patientId: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
