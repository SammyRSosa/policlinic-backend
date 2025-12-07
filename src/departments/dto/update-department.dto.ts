import { IsOptional, IsUUID, IsNotEmpty } from 'class-validator';

export class UpdateDepartmentDto {
  @IsOptional()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsUUID()
  headWorkerId?: string;
}
