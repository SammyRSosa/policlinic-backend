import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ConsultationStatus } from '../consultation.entity';

export class UpdateConsultationStatusDto {
  @IsEnum(ConsultationStatus)
  status: ConsultationStatus;

  @IsOptional()
  @IsString()
  diagnosis?: string;
}
