import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Patient } from './patients/patient.entity';
import { Medication } from './medications/medication.entity';

import { User, UserRole } from './users/user.entity';
import { Worker } from './workers/worker.entity';
import { ClassSerializerInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const isTestEnv = process.env.NODE_ENV === 'test';

  // 🧪 NO ejecutar seeds en modo test
  if (!isTestEnv) {
    /* =========================
       🔐 Seed SUPER ADMIN
       ========================= */
    
    const userRepo = app.get(getRepositoryToken(User));

    const existingSuperAdmin = await userRepo.findOne({
      where: { role: UserRole.ADMIN },
    });

  if (!existingSuperAdmin) {
    const hashedPassword = await bcrypt.hash('superadmin123', 10);
    const superAdmin = userRepo.create({
      username: 'superadmin',
      password: hashedPassword,
      role: UserRole.ADMIN,
    });
    await userRepo.save(superAdmin);
    console.log('✅ Super admin created: username=superadmin, password=superadmin123');
  } else {
    console.log('ℹ️ Super admin already exists.');
  }

  app.enableCors({
    origin: 'http://localhost:3001',
    credentials: true,
  });


  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get(Reflector)),
  );

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`🚀 Application running on: http://localhost:${port}`);
}

bootstrap();