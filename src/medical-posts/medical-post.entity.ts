// src/medical-posts/medical-post.entity.ts
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class MedicalPost {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;
}
