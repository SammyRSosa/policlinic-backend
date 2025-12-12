import { IsUUID, IsOptional, IsDateString, IsIn } from 'class-validator';

export class CreateProgrammedConsultationDto {
  @IsUUID()
  patientId: string;

  @IsDateString()
  scheduledAt: string;

  @IsOptional()
  @IsUUID()
  remissionId?: string;

  @IsOptional()
  @IsIn(['internal', 'external'])
  remissionType?: 'internal' | 'external';
}
