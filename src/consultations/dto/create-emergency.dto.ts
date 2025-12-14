import { IsUUID } from 'class-validator';

export class CreateEmergencyConsultationDto {
  @IsUUID()
  patientId: string;
}
