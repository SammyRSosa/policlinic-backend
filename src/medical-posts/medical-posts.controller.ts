// src/medical-posts/medical-posts.controller.ts
import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { MedicalPostsService } from './medical-posts.service';
import { CreateMedicalPostDto } from './dto/create-medical-post.dto';

@Controller('medical-posts')
export class MedicalPostsController {
  constructor(private readonly medicalPostsService: MedicalPostsService) {}

  @Get()
  findAll() {
    return this.medicalPostsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.medicalPostsService.findOne(Number(id));
  }

  @Post()
  create(@Body() body: CreateMedicalPostDto) {
    return this.medicalPostsService.create(body.name);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.medicalPostsService.remove(Number(id));
  }
}
