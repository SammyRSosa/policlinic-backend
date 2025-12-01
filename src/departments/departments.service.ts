import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Department } from './department.entity';
import { Stock } from 'src/stocks/stock.entity';
import { HeadOfDepartment } from 'src/heads-of-departments/head-of-department.entity';
import { Worker, WorkerRole } from 'src/workers/worker.entity';

@Injectable()
export class DepartmentsService {
  constructor(
    @InjectRepository(Department)
    private departmentsRepo: Repository<Department>,

    @InjectRepository(Stock)
    private stocksRepo: Repository<Stock>,

    @InjectRepository(HeadOfDepartment)
    private headsRepo: Repository<HeadOfDepartment>,

    @InjectRepository(Worker)
    private readonly workersRepo: Repository<Worker>,
  ) { }

  async findByHead(headCode: string) {
    return this.departmentsRepo
      .createQueryBuilder('department')
      .leftJoinAndSelect('department.headOfDepartment', 'hod')
      .leftJoinAndSelect('hod.worker', 'worker')
      .where('worker.code = :code', { code: headCode })
      .getOne();
  }

  async create(name: string, headWorkerId: string) {
    // 1. Find the worker who will be the head
    const worker = await this.workersRepo.findOne({
      where: { id: headWorkerId },
    });
    if (!worker) throw new NotFoundException('Worker not found');


    worker.role = WorkerRole.HEAD_OF_DEPARTMENT; // <-- put the correct enum if needed, e.g. WorkerRole.HEAD
    await this.workersRepo.save(worker);

    // 2. Create the HeadOfDepartment entity
    const head = this.headsRepo.create({
      worker,
      assignedAt: new Date(),
    });
    await this.headsRepo.save(head);

    // 3. Create the Department first
    const department = this.departmentsRepo.create({
      name,
      headOfDepartment: head,
    });
    await this.departmentsRepo.save(department);

    // 4. Create a stock for this department
    const stock = this.stocksRepo.create({
      department, // associate stock with this department
    });
    await this.stocksRepo.save(stock);

    // 5. Assign the department to the head
    head.department = department;
    await this.headsRepo.save(head);

    // 6. Attach stock to department (optional if you want the relation loaded)
    department.stocks = [stock];

    return department;
  }

  async findAll() {
    return this.departmentsRepo.find({
      relations: ['workers', 'headOfDepartment'],
    });
  }

  async findOne(id: string) {
    const department = await this.departmentsRepo.findOne({ where: { id } });
    if (!department) throw new NotFoundException('Department not found');
    return department;
  }

  async update(id: string, dto: { name?: string; headWorkerId?: string }) {
    const department = await this.findOne(id);

    if (dto.name) {
      department.name = dto.name;
    }

    if (dto.headWorkerId) {
      const worker = await this.workersRepo.findOne({
        where: { id: dto.headWorkerId },
      });
      if (!worker) throw new NotFoundException('Worker not found');

      // Check if HeadOfDepartment already exists
      if (!department.headOfDepartment) {
        // Create new HeadOfDepartment if it doesn't exist
        const head = this.headsRepo.create({
          worker,
          department,
        });
        department.headOfDepartment = await this.headsRepo.save(head);
      } else {
        // Update existing HeadOfDepartment
        department.headOfDepartment.worker = worker;
        department.headOfDepartment = await this.headsRepo.save(
          department.headOfDepartment,
        );
      }
    }

    return this.departmentsRepo.save(department);
  }

  async remove(id: string) {
    const department = await this.findOne(id);
    await this.departmentsRepo.remove(department);
    return { message: 'Department removed successfully' };
  }
}
