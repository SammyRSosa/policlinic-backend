import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Worker, WorkerRole } from './worker.entity';
import { Department } from '../departments/department.entity';
import { WorkerDepartment } from '../workers-department/worker-department.entity';
import { HeadOfDepartment } from '../heads-of-departments/head-of-department.entity';
import { User, UserRole } from '../users/user.entity';
import { CreateWorkerDto } from './dto/create-worker.dto';
import { UpdateWorkerDto } from './dto/update-worker.dto';
import { IsNull } from 'typeorm';

@Injectable()
export class WorkersService {
  constructor(
    @InjectRepository(Worker) private workersRepo: Repository<Worker>,
    @InjectRepository(Department) private departmentsRepo: Repository<Department>,
    @InjectRepository(WorkerDepartment) private wdRepo: Repository<WorkerDepartment>,
    @InjectRepository(HeadOfDepartment) private headsRepo: Repository<HeadOfDepartment>,

  ) { }

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


    if (dto.role === WorkerRole.HEAD_OF_DEPARTMENT && department?.headOfDepartment) {
      throw new ForbiddenException(
        'This department already has a head assigned'
      );
    }


    const workerData: Partial<Worker> = {
      firstName: dto.firstName,
      lastName: dto.lastName,
      role: dto.role,
      department: department ?? undefined,
      code: this.generateWorkerCode(dto.firstName, dto.lastName),
    };

    // Usar transacción para crear worker y registros relacionados
    return await this.workersRepo.manager.transaction(async (manager) => {
      const workerRepo = manager.getRepository(Worker);
      const wdRepo = manager.getRepository(WorkerDepartment);
      const headsRepo = manager.getRepository(HeadOfDepartment);
      const departmentsRepo = manager.getRepository(Department);

      const worker = workerRepo.create(workerData);
      await workerRepo.save(worker);

      // Si hay department asignado, crear historial (WorkerDepartment)
      if (department) {
        const workerDept = wdRepo.create({
          worker,
          department,
          active: true,
        });
        await wdRepo.save(workerDept);
      }

      // Si es HEAD_OF_DEPARTMENT: crear HeadOfDepartment y actualizar department.headOfDepartment
      if (dto.role === WorkerRole.HEAD_OF_DEPARTMENT && department) {
        // (Opcional) finalizar head anterior si existe
        // Crear nuevo HeadOfDepartment
        const head = headsRepo.create({
          worker,
          department,
          assignedAt: new Date(),
        });
        await headsRepo.save(head);

        // Actualizar department.headOfDepartment (si quieres guardarlo en la entidad)
        const deptToUpdate = await departmentsRepo.findOne({
          where: { id: department.id },
          relations: ['headOfDepartment'],
        });

        if (deptToUpdate) {
          deptToUpdate.headOfDepartment = head;
          await departmentsRepo.save(deptToUpdate);
        }

      }

      return worker;
    });
  }

  // Modificar findAll para traer solo activos
  async findAll() {
    return this.workersRepo.find({
      where: { active: true },
      relations: ['department'],
    });
  }


  // findByUserId: si quieres, podemos validar que el worker esté activo
  async findByUserId(userId: string) {
    const worker = await this.workersRepo.findOne({
      where: { user: { id: userId }, active: true },
      relations: ['department', 'user'],
    });

    if (!worker) throw new NotFoundException('Worker not found or inactive');
    return worker;
  }


  async updateWorker(id: string, updateData: UpdateWorkerDto) {
    // 1️⃣ Find the worker with department and role info
    const worker = await this.workersRepo.findOne({
      where: { id },
      relations: ['department'],
    });
    if (!worker) throw new NotFoundException('Worker not found');

    // 2️⃣ Update basic fields
    if (updateData.firstName) worker.firstName = updateData.firstName;
    if (updateData.lastName) worker.lastName = updateData.lastName;

    // 3️⃣ Update department if requested
    if (updateData.departmentId) {
      const department = await this.departmentsRepo.findOne({
        where: { id: updateData.departmentId },
        relations: ['headOfDepartment'],
      });
      if (!department) throw new NotFoundException('Department not found');
      worker.department = department;
    }

    // 4️⃣ Handle role changes
    if (updateData.role) {
      if (updateData.role === WorkerRole.HEAD_OF_DEPARTMENT) {
        // Worker must have a department
        if (!worker.department)
          throw new ForbiddenException(
            'Worker must belong to a department to be Head of Department'
          );

        const department = await this.departmentsRepo.findOne({
          where: { id: worker.department.id },
          relations: ['headOfDepartment'],
        });

        if (!department) throw new NotFoundException('Department not found');

        if (department.headOfDepartment) {
          // Demote previous head to doctor
          const previousHead = department.headOfDepartment.worker;
          previousHead.role = WorkerRole.DOCTOR;
          await this.workersRepo.save(previousHead);

          // End previous HeadOfDepartment record
          department.headOfDepartment.endedAt = new Date();
          await this.headsRepo.save(department.headOfDepartment);
        }

        // Promote current worker
        worker.role = WorkerRole.HEAD_OF_DEPARTMENT;
        await this.workersRepo.save(worker);

        // Create new HeadOfDepartment record
        const head = this.headsRepo.create({
          worker,
          department,
          assignedAt: new Date(),
        } as HeadOfDepartment);

        await this.headsRepo.save(head);

        // Update department link
        department.headOfDepartment = head;
        await this.departmentsRepo.save(department);
      } else {
        // Any other role change
        worker.role = updateData.role;
      }
    }

    // 5️⃣ Save worker
    return this.workersRepo.save(worker);
  }


  // Método para soft delete
  async softDeleteWorker(id: string) {
    const worker = await this.workersRepo.findOne({
      where: { id },
      relations: ['headOfDepartment', 'departmentHistory'],
    });

    if (!worker) throw new NotFoundException('Worker not found');

    // 1. Soft delete del worker
    worker.active = false;
    await this.workersRepo.save(worker);

    // 2. Si es jefe de departamento, actualizar HeadOfDepartment y Department
    const headRecord = await this.headsRepo.findOne({
      where: {
        worker: { id: worker.id },
        endedAt: IsNull(),
      },
      relations: ['department'],
    });

    if (headRecord) {
      // Fecha de fin del jefe
      headRecord.endedAt = new Date();
      await this.headsRepo.save(headRecord);

      // Quitar referencia en Department
      if (headRecord.department) {
        headRecord.department.headOfDepartment = null;
        await this.departmentsRepo.save(headRecord.department);
      }
    }

    // 3. Marcar como inactivo en WorkerDepartment
    const activeDeptRecords = await this.wdRepo.find({
      where: { worker: { id: worker.id }, active: true },
      relations: ['department'],
    });

    for (const wd of activeDeptRecords) {
      wd.active = false;
      wd.leftAt = new Date();
      await this.wdRepo.save(wd);
    }

    return worker;
  }



  async getWorkersByDepartment(departmentId: string) {
    const workers = await this.workersRepo.find({
      where: {
        department: { id: departmentId },
        active: true,
      },
      relations: ['department'],
      order: { firstName: 'ASC' },
    });

    return workers;
  }
}

