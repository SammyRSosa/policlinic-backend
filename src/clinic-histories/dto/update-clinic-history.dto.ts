import { IsString } from 'class-validator';

export class UpdateClinicHistoryDto {
  @IsString()
  notes: string;
}
