import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkerDepartment } from './worker-department.entity';
import { Worker } from 'src/workers/worker.entity';
import { Department } from 'src/departments/department.entity';

@Injectable()
export class WorkerDepartmentService {
  constructor(
    @InjectRepository(WorkerDepartment)
    private wdRepo: Repository<WorkerDepartment>,
    @InjectRepository(Worker)
    private workersRepo: Repository<Worker>,
    @InjectRepository(Department)
    private departmentsRepo: Repository<Department>,
  ) {}

  async assign(workerId: string, departmentId: string) {
    const worker = await this.workersRepo.findOne({
      where: { id: workerId },
    relations: ['department'],
    });
    if (!worker) throw new NotFoundException('Worker not found');

    const department = await this.departmentsRepo.findOne({
      where: { id: departmentId },
    relations: ['workers'],
    });
    if (!department) throw new NotFoundException('Department not found');

  // Deactivate previous assignments
    await this.wdRepo.update(
      { worker: { id: workerId }, active: true },
      { active: false, leftAt: new Date() },
    );

    // Create new assignment
    const assignment = new WorkerDepartment();
    assignment.worker = worker;
    assignment.department = department;
    assignment.active = true;
  
  await this.wdRepo.save(assignment);

  // Update worker's current department
  worker.department = department;
  await this.workersRepo.save(worker);

  return assignment;
  }

  findAll() {
    return this.wdRepo.find({
      where: { active: true },
      relations: ['worker', 'department'],
      order: { joinedAt: 'DESC' },
    });
  }

  async findByDepartment(departmentId: string) {
    const department = await this.departmentsRepo.findOne({
      where: { id: departmentId },
    });
    if (!department) throw new NotFoundException('Department not found');

    return this.wdRepo.find({
      where: { department: { id: departmentId }, active: true },
      relations: ['worker', 'department'],
      order: { joinedAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const assignment = await this.wdRepo.findOne({
      where: { id },
      relations: ['worker', 'department'],
    });
    if (!assignment) throw new NotFoundException('Assignment not found');
    return assignment;
  }

  async deactivate(id: string) {
    const assignment = await this.findOne(id);
    
    if (!assignment.active) {
      throw new BadRequestException('Assignment is already inactive');
    }

    assignment.active = false;
    assignment.leftAt = new Date();

    // Clear worker's department if this was their current department
    if (assignment.worker.department?.id === assignment.department.id) {
      assignment.worker.department = undefined;
      await this.workersRepo.save(assignment.worker);
    }

    // Remove worker from department's workers list
    const department = await this.departmentsRepo.findOne({
      where: { id: assignment.department.id },
      relations: ['workers'],
    });

    if (department) {
      department.workers = department.workers.filter(
        (worker) => worker.id !== assignment.worker.id,
      );
      await this.departmentsRepo.save(department);
    }

    return this.wdRepo.save(assignment);
  }
}