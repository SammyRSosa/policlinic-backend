import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersService } from './users/users.service';
import { UsersModule } from './users/users.module';
import { MedicationsModule } from './medications/medications.module';
import { DepartmentsModule } from './departments/departments.module';
import { DepartmentStocksModule } from './department-stocks/department-stocks.module';
import { RemissionsModule } from './remissions/remissions.module';
import { ConsultationsModule } from './consultations/consultations.module';
import { WorkersModule } from './workers/workers.module';
import { PatientsModule } from './patients/patients.module';
import { WorkerDepartmentModule } from './workers-department/workers-department.module';
import { ConsultationPrescriptionsModule } from './consultations-prescriptions/consultations-prescriptions.module';
import { MedicationOrdersModule } from './medication-orders/medication-orders.module';
import { MedicationDeliveriesModule } from './medication-deliveries/medication-deliveries.module';
import { ClinicHistoryModule } from './clinic-histories/clinic-histories.module';
import { HeadsOfDepartmentsModule } from './heads-of-departments/heads-of-departments.module';

import { StockItemsModule } from './stock-items/stock-items.module';
import { StockItemsService } from './stock-items/stocks-items.service';
import { MedicationOrderItemsModule } from './medication-order-items/medication-order-items.module';
import { MedicalPostsModule } from './medical-posts/medical-posts.module';
import { SeedModule } from './seed/seed.module';  

import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { MedicationDelivery } from './medication-deliveries/medication-delivery.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5436,
      username: 'policlinic',
      password: 'policlinicpass',
      database: 'poldb',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    UsersModule,
    DepartmentsModule,
    MedicationsModule,
    DepartmentStocksModule,
    RemissionsModule,
    ConsultationsModule,
    WorkersModule,
    PatientsModule,
    WorkerDepartmentModule,
    ConsultationPrescriptionsModule,
    MedicationOrdersModule,
    MedicationDeliveriesModule,
    ClinicHistoryModule,
    HeadsOfDepartmentsModule,
    StockItemsModule,
    MedicationOrderItemsModule,
    AuthModule,
    MedicalPostsModule,
    SeedModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

