import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { HeadOfDepartment } from './head-of-department.entity';

@Injectable()
export class HeadsOfDepartmentsService {
  constructor(
    @InjectRepository(HeadOfDepartment)
    private repo: Repository<HeadOfDepartment>,
  ) {}

  // Obtener jefe actual de un departamento (endedAt = null)
  async getCurrentByDepartment(departmentId: string) {
    return this.repo.findOne({
      where: {
        department: { id: departmentId },
        endedAt: IsNull(),
      },
      relations: ['worker', 'department'],
    });
  }

  // Obtener si un worker es jefe actualmente
  async getCurrentByWorker(workerId: string) {
    return this.repo.findOne({
      where: {
        worker: { id: workerId },
        endedAt: IsNull(),
      },
      relations: ['worker', 'department'],
    });
  }

  // Historial de jefes de un departamento
  async getHistoryByDepartment(departmentId: string) {
    return this.repo.find({
      where: {
        department: { id: departmentId },
      },
      order: { assignedAt: 'DESC' },
      relations: ['worker', 'department'],
    });
  }
}
