import { IsEnum, IsOptional, IsString } from 'class-validator';
import { DeliveryStatus } from '../medication-delivery.entity';

export class UpdateMedicationDeliveryStatusDto {
  @IsEnum(DeliveryStatus)
  status: DeliveryStatus;

  @IsOptional()
  @IsString()
  comment?: string;
}
