import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateMedicalPostDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;
}
