// src/users/users.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './user.entity';
import { Worker } from '../workers/worker.entity';
import { Patient } from '../patients/patient.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Worker, Patient]), // repositories needed
  ],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
