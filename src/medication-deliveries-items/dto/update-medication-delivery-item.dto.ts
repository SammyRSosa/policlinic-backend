import { IsInt, Min } from 'class-validator';

export class UpdateMedicationDeliveryItemDto {
  @IsInt()
  @Min(0)
  quantity: number;
}
