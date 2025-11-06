import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User } from '../users/user.entity';
import { Worker } from '../workers/worker.entity';
import { Patient } from '../patients/patient.entity';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Worker, Patient]),
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'ccf52bb593d2a5f3fb1cc1eb3a9129073bda116b50b9363cebde531d1b42af4a78dafc87f85905d69bc3e478ea12a76f19caff9bd38c7651a2b3676c907db830',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
