import { IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CreateDepartmentDto {
  @IsNotEmpty()
  name: string;

  @IsUUID()
  headWorkerId: string; // opcional si se crea sin asignar jefe
}
