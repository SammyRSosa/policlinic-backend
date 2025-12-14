import { IsUUID } from 'class-validator';

export class GetByPatientDto {
  @IsUUID()
  patientId: string;
}
