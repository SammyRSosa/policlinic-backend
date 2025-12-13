import { IsUUID } from 'class-validator';

export class CreateWorkerDepartmentDto {
  @IsUUID()
  workerId: string;

  @IsUUID()
  departmentId: string;
}
