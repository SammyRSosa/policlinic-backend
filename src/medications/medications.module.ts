import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedicationsService } from './medications.service';
import { MedicationsController } from './medications.controller';
import { Medication } from './medication.entity'; // ✅ Agregar import

@Module({
  imports: [TypeOrmModule.forFeature([Medication])], // ✅ Agregar esto
  providers: [MedicationsService],
  controllers: [MedicationsController],
  exports: [MedicationsService], // ✅ Agregar export si otros módulos lo necesitan
})
export class MedicationsModule {}