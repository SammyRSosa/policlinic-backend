// src/medical-posts/medical-posts.controller.ts
import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { MedicalPostsService } from './medical-posts.service';

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
  create(@Body('name') name: string) {
    return this.medicalPostsService.create(name);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.medicalPostsService.remove(Number(id));
  }
}
