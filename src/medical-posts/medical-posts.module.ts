// src/medical-posts/medical-posts.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedicalPost } from './medical-post.entity';
import { MedicalPostsService } from './medical-posts.service';
import { MedicalPostsController } from './medical-posts.controller';

@Module({
  imports: [TypeOrmModule.forFeature([MedicalPost])],
  providers: [MedicalPostsService],
  controllers: [MedicalPostsController],
  exports: [MedicalPostsService], // opcional: por si otro módulo lo usa
})
export class MedicalPostsModule {}
