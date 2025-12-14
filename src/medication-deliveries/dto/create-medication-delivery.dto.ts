import {
  IsUUID,
  IsArray,
  ValidateNested,
  IsInt,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

class CreateMedicationDeliveryItemDto {
  @IsUUID()
  medicationId: string;

  @IsInt()
  @Min(1)
  quantity: number;
}

export class CreateMedicationDeliveryDto {
  @IsUUID()
  departmentId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateMedicationDeliveryItemDto)
  items: CreateMedicationDeliveryItemDto[];
}
