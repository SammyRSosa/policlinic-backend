import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Worker, WorkerRole } from './worker.entity';
import { Department } from '../departments/department.entity';
import { User, UserRole } from '../users/user.entity';
import { CreateWorkerDto } from './dto/create-worker.dto';

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
}

