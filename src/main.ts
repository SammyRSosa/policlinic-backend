import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './users/user.entity';
import * as bcrypt from 'bcrypt';
import { UserRole } from './users/user.entity';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Seed super admin
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
    origin: 'http://localhost:3001', // frontend URL
    credentials: true,               // if you send cookies or auth headers
  });

  await app.listen(process.env.PORT ?? 3000);
  console.log(`🚀 Application running on: http://localhost:${process.env.PORT ?? 3000}`);
}
bootstrap();
