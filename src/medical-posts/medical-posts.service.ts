// src/medical-posts/medical-posts.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MedicalPost } from './medical-post.entity';

@Injectable()
export class MedicalPostsService {
  constructor(
    @InjectRepository(MedicalPost)
    private readonly postRepo: Repository<MedicalPost>,
  ) {}

  async findAll() {
    return this.postRepo.find();
  }

  async findOne(id: number) {
    const post = await this.postRepo.findOne({ where: { id } });
    if (!post) throw new NotFoundException('Medical post not found');
    return post;
  }

  async create(name: string) {
    const newPost = this.postRepo.create({ name });
    return this.postRepo.save(newPost);
  }

  async remove(id: number) {
    const post = await this.findOne(id);
    return this.postRepo.remove(post);
  }
}
