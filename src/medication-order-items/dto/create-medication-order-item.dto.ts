import { IsUUID, IsInt, Min } from 'class-validator';

export class CreateMedicationOrderItemDto {
  @IsUUID()
  orderId: string;

  @IsUUID()
  medicationId: string;

  @IsInt()
  @Min(1)
  quantity: number;
}
