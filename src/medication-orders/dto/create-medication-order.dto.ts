import { IsArray, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class MedicationOrderItemDto {
  @IsString()
  @IsNotEmpty()
  stockItemId: string;

  @IsNotEmpty()
  quantity: number;
}

export class CreateMedicationOrderDto {
  @IsString()
  @IsNotEmpty()
  departmentId: string;

  @IsString()
  @IsNotEmpty()
  headId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MedicationOrderItemDto)
  items: MedicationOrderItemDto[];
}