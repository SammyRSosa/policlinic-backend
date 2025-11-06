import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './user.entity';
import { Worker } from '../workers/worker.entity';
import { Patient } from '../patients/patient.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private usersRepo: Repository<User>,
    @InjectRepository(Worker) private workersRepo: Repository<Worker>,
    @InjectRepository(Patient) private patientsRepo: Repository<Patient>,
  ) {}

  // Get all users
  async findAll() {
    return this.usersRepo.find({
      relations: ['worker', 'patient'],
      select: ['id', 'username', 'role', 'worker', 'patient'],
    });
  }

  // Get one user by ID
  async findOne(id: string) {
    const user = await this.usersRepo.findOne({
      where: { id },
      relations: ['worker', 'patient'],
      select: ['id', 'username', 'role', 'worker', 'patient'],
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  // Update user role
  async updateRole(id: string, role: UserRole) {
    const user = await this.usersRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    user.role = role;
    return this.usersRepo.save(user);
  }

  // Optional: Delete user
  async remove(id: string) {
    const user = await this.usersRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return this.usersRepo.remove(user);
  }
}
