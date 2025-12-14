import { IsUUID, IsInt, Min, IsOptional, IsString } from 'class-validator';

export class CreateConsultationPrescriptionDto {
  @IsUUID()
  consultationId: string;

  @IsUUID()
  medicationId: string;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsOptional()
  @IsString()
  instructions?: string;
}
