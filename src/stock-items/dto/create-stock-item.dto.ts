import { IsUUID, IsInt, Min, IsOptional } from 'class-validator';

export class CreateStockItemDto {
  @IsUUID()
  medicationId: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  quantity?: number;
}
