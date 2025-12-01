import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Worker, WorkerRole } from './worker.entity';
import { Department } from '../departments/department.entity';
import { User, UserRole } from '../users/user.entity';
import { CreateWorkerDto } from './dto/create-worker.dto';
import { UpdateWorkerDto } from './dto/update-worker.dto';

@Injectable()
export class WorkersService {
  constructor(
    @InjectRepository(Worker) private workersRepo: Repository<Worker>,
    @InjectRepository(Department) private departmentsRepo: Repository<Department>,
  ) {}

  private generateWorkerCode(firstName: string, lastName: string) {
    const randomDigits = Math.floor(1000 + Math.random() * 9000); // 4 digits
    return `${firstName[0].toUpperCase()}${lastName[0].toUpperCase()}${randomDigits}`;
  }

  async create(dto: CreateWorkerDto, creator: User) {
    if (!creator) throw new ForbiddenException('You must be logged in');

    let department: Department | null | undefined;

    if (creator.role === UserRole.HEAD_OF_DEPARTMENT) {
      if (dto.role === WorkerRole.ADMIN)
        throw new ForbiddenException('Heads cannot create admins');

      department = await this.departmentsRepo.findOne({
        where: { headOfDepartment: { id: creator.id } },
      });
      if (!department)
        throw new ForbiddenException('You are not head of any department');
    }

    if (creator.role === UserRole.ADMIN && dto.departmentId) {
      department = await this.departmentsRepo.findOne({
        where: { id: dto.departmentId },
      });
      if (!department)
        throw new NotFoundException('Department not found');
    }

    const workerData: Partial<Worker> = {
      firstName: dto.firstName,
      lastName: dto.lastName,
      role: dto.role,
      department: department ?? undefined,
      code: this.generateWorkerCode(dto.firstName, dto.lastName),
    };

    const worker = this.workersRepo.create(workerData);
    return this.workersRepo.save(worker);
  }

  findAll() {
    return this.workersRepo.find({ relations: ['department'] });
  }


  async findByUserId(userId: string) {
  const worker = await this.workersRepo.findOne({
    where: { user: { id: userId } },
    relations: ['department', 'user']
  });
  
  if (!worker) {
    throw new NotFoundException('Worker not found for this user');
  }
  
  return worker;
}

  async updateWorker(
    id: string,
    updateData: UpdateWorkerDto,
  ) {
    const worker = await this.workersRepo.findOne({ where: { id }, relations: ['department'] })
    if (!worker) throw new NotFoundException('Worker not found')

    if (updateData.firstName) worker.firstName = updateData.firstName
    if (updateData.lastName) worker.lastName = updateData.lastName
    if (updateData.role) worker.role = updateData.role

    if (updateData.departmentId) {
      const department = await this.departmentsRepo.findOne({ where: { id: updateData.departmentId } })
      if (!department) throw new NotFoundException('Department not found')
      worker.department = department
    }

    return this.workersRepo.save(worker)
  }

  async remove(id: string) {
    const worker = await this.workersRepo.findOne({ where: { id } });
    if (!worker) throw new NotFoundException('User not found');
    return this.workersRepo.remove(worker);
  }

  async getWorkersByDepartment(departmentId: string) {
  const workers = await this.workersRepo.find({
    where: { department: { id: departmentId } },
    relations: ['department'],
    order: { firstName: 'ASC' },
  });

  return workers;
}
}

