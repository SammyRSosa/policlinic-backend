// dto/medication-consumption.dto.ts
import { IsUUID, IsDateString } from 'class-validator';

export class MedicationConsumptionDto {
  @IsUUID()
  medicationId: string;

  // formato: 2025-01-01
  @IsDateString()
  month: string;
}
