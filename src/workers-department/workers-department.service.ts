import { Injectable, NotFoundException } from '@nestjs/common';
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
    return this.wdRepo.find({ relations: ['worker', 'department'] });
  }

  async findByDepartment(departmentId: string) {
    const department = await this.departmentsRepo.findOne({ where: { id: departmentId } });
    if (!department) throw new NotFoundException('Department not found');

    return this.wdRepo.find({
      where: { department: { id: departmentId }, active: true },
      relations: ['worker', 'department'],
    });
  }

  async findOne(id: string) {
    const assignment = await this.wdRepo.findOne({ where: { id }, relations: ['worker', 'department'] });
    if (!assignment) throw new NotFoundException('Assignment not found');
    return assignment;
  }

  async remove(id: string) {
    const assignment = await this.findOne(id);
    return this.wdRepo.remove(assignment);
  }
}
