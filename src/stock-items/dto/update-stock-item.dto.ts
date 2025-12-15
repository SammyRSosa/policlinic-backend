import { 
  IsInt, 
  IsOptional, 
  IsUUID, 
  Min
} from 'class-validator';


export class UpdateStockItemDto {
  @IsUUID('4', { message: 'Department ID must be a valid UUID' })
  departmentId: string;

  @IsUUID('4', { message: 'Medication ID must be a valid UUID' })
  medicationId: string;

  @IsOptional()
  @IsInt({ message: 'Min threshold must be an integer' })
  @Min(0, { message: 'Min threshold cannot be negative' })
  minThreshold?: number;

  @IsOptional()
  @IsInt({ message: 'Max threshold must be an integer' })
  @Min(0, { message: 'Max threshold cannot be negative' })
  maxThreshold?: number;
}