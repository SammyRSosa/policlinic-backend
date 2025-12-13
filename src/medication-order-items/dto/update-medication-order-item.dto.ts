import { IsInt, Min } from 'class-validator';

export class UpdateMedicationOrderItemDto {
  @IsInt()
  @Min(0)
  quantity: number;
}
