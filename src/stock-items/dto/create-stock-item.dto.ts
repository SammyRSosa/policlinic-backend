import { 
  IsInt, 
  IsOptional, 
  IsUUID, 
  Min
} from 'class-validator';

/**
 * DTO for creating a stock item
 */
export class CreateStockItemDto {
  @IsUUID()
  medicationId: string;

  @IsInt()
  @Min(0, { message: 'Quantity cannot be negative' })
  quantity: number = 0;

  @IsOptional()
  @IsInt()
  @Min(0, { message: 'Min threshold cannot be negative' })
  minThreshold?: number = 0;

  @IsOptional()
  @IsInt()
  @Min(0, { message: 'Max threshold cannot be negative' })
  maxThreshold?: number = 1000;
}