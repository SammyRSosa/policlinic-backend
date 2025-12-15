import { Injectable, NotFoundException, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Department } from './department.entity';
import { HeadOfDepartment } from 'src/heads-of-departments/head-of-department.entity';
import { Worker, WorkerRole } from 'src/workers/worker.entity';
import { WorkerDepartment } from 'src/workers-department/worker-department.entity';
import { User } from 'src/users/user.entity';
import { BadRequestException} from '@nestjs/common';
@Injectable()
export class DepartmentsService implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(Department)
    private departmentsRepo: Repository<Department>,

    @InjectRepository(HeadOfDepartment)
    private headsRepo: Repository<HeadOfDepartment>,

    @InjectRepository(Worker)
    private readonly workersRepo: Repository<Worker>,

    @InjectRepository(WorkerDepartment)
    private readonly workersdepsRepo: Repository<WorkerDepartment>,
  ) { }

  // departments.service.ts
  async findByHead(workerId: string) {
    // Find the worker
    const worker = await this.workersRepo.findOne({
      where: { id: workerId },
      relations: ['department'],
    });

    if (!worker) throw new NotFoundException('Worker not found');

    // If worker has a department assigned, return it
    if (worker.department) {
      return this.departmentsRepo.findOne({
        where: { id: worker.department.id },
        relations: ['headOfDepartment', 'headOfDepartment.worker', 'workers', 'stockItems'],
      });
    }

    // If worker is a head of department, find via HeadOfDepartment
    const head = await this.headsRepo.findOne({
      where: { worker: { id: workerId } },
      relations: ['department', 'department.workers', 'department.headOfDepartment'],
    });

    if (!head) throw new NotFoundException('Worker not assigned to any department');

    return head.department;
  }

  async create(name: string, headWorkerId: string) {
    // 1. Find the worker who will be the head
    const worker = await this.workersRepo.findOne({
      where: { id: headWorkerId },
    });
    if (!worker) throw new NotFoundException('Worker not found');

    // 2. Update worker role to HEAD_OF_DEPARTMENT
    worker.role = WorkerRole.HEAD_OF_DEPARTMENT;
    await this.workersRepo.save(worker);

    // 3. Create the Department first
    const department = this.departmentsRepo.create({
      name,
    });
    await this.departmentsRepo.save(department);

    // 4. Create the HeadOfDepartment entity
    const head = this.headsRepo.create({
      worker,
      department,
      assignedAt: new Date(),
    });
    await this.headsRepo.save(head);

    // 5. Update department with head
    department.headOfDepartment = head;
    await this.departmentsRepo.save(department);

    // 6. ✅ Assign worker to department via WorkerDepartment
    const workerDept = new WorkerDepartment();
    workerDept.worker = worker;
    workerDept.department = department;
    workerDept.active = true;
    await this.workersdepsRepo.save(workerDept);

    // 7. ✅ Update worker's current department
    worker.department = department;
    await this.workersRepo.save(worker);

    return department;
  }

  async searchByName(q: string) {
    return this.departmentsRepo
      .createQueryBuilder('d')
      .where('LOWER(d.name) LIKE :q', { q: `%${q.toLowerCase()}%` })
      .getMany();
  }


  async findAll() {
    return this.departmentsRepo.find({
      relations: ['workers', 'headOfDepartment', 'headOfDepartment.worker'],
    });
  }

  async findOne(id: string) {
    const department = await this.departmentsRepo.findOne({
      where: { id },
      relations: ['headOfDepartment', 'headOfDepartment.worker'],
    });
    if (!department) throw new NotFoundException('Department not found');
    return department;
  }

  async update(id: string, dto: { name?: string; headWorkerId?: string }) {
    const department = await this.departmentsRepo.findOne({
      where: { id },
      relations: ['headOfDepartment', 'headOfDepartment.worker'],
    });

    if (!department) {
      throw new NotFoundException('Department not found');
    }

    if (dto.name) {
      department.name = dto.name;
    }

    if (dto.headWorkerId) {
      // 🧠 Load new head
      const newHead = await this.workersRepo.findOne({
        where: { id: dto.headWorkerId },
        relations: ['department'],
      });

      if (!newHead) {
        throw new NotFoundException('Worker not found');
      }

      // ✅ Check if worker is already head of a different department
      const existingHeadPosition = await this.headsRepo.findOne({
        where: {
          worker: { id: newHead.id },
        },
        relations: ['department'],
      });

      if (
        existingHeadPosition &&
        existingHeadPosition.department.id !== department.id
      ) {
        throw new BadRequestException(
          `Worker is already head of department "${existingHeadPosition.department.name}". A worker cannot be head of multiple departments.`,
        );
      }

      // 🚨 If there is a previous head and it is changing
      if (
        department.headOfDepartment &&
        department.headOfDepartment.worker.id !== newHead.id
      ) {
        const previousHead = department.headOfDepartment.worker;

        // 1️⃣ Downgrade previous head role
        previousHead.role = WorkerRole.DOCTOR;
        await this.workersRepo.save(previousHead);

        // 2️⃣ Deactivate previous WorkerDepartment
        await this.workersdepsRepo.update(
          {
            worker: { id: previousHead.id },
            department: { id: department.id },
            active: true,
          },
          {
            active: false,
            leftAt: new Date(),
          },
        );
      }

      // 3️⃣ Promote new head
      newHead.role = WorkerRole.HEAD_OF_DEPARTMENT;
      await this.workersRepo.save(newHead);

      // 4️⃣ Assign / update HeadOfDepartment entity
      if (!department.headOfDepartment) {
        const head = this.headsRepo.create({
          worker: newHead,
          department,
          assignedAt: new Date(),
        });
        department.headOfDepartment = await this.headsRepo.save(head);
      } else {
        department.headOfDepartment.worker = newHead;
        department.headOfDepartment = await this.headsRepo.save(
          department.headOfDepartment,
        );
      }

      // 5️⃣ Ensure WorkerDepartment is active for new head
      let workerDept = await this.workersdepsRepo.findOne({
        where: {
          worker: { id: newHead.id },
          department: { id: department.id },
        },
      });

      if (!workerDept) {
        workerDept = this.workersdepsRepo.create({
          worker: newHead,
          department,
          active: true,
        });
      } else {
        workerDept.active = true;
        workerDept.leftAt = undefined;
      }

      await this.workersdepsRepo.save(workerDept);

      // 6️⃣ Update worker current department
      newHead.department = department;
      await this.workersRepo.save(newHead);
    }

    return this.departmentsRepo.save(department);
  }


  async remove(id: string) {
    const department = await this.findOne(id);
    await this.departmentsRepo.remove(department);
    return { message: 'Department removed successfully' };
  }

  async onApplicationBootstrap() {
      if (process.env.NODE_ENV === 'test') return; // ❌ saltar seeds en test
    console.log('🔧 Inicializando departamentos por defecto...');

    const defaultDepartments = [
      'Droguería',
      'Almacén',

      // 👇 nuevos (8)
      'Emergencias',
      'Pediatría',
      'Medicina Interna',
      'Cirugía',
      'Ginecología',
      'Ortopedia',
      'Cardiología',
      'Neurología',
    ];

    for (const name of defaultDepartments) {
      const exists = await this.departmentsRepo.findOne({ where: { name } });

      if (!exists) {
        console.log(`➡️ Creando departamento inicial: ${name}`);

        const department = this.departmentsRepo.create({ name });
        await this.departmentsRepo.save(department);
      } else {
        console.log(`✔️ Departamento '${name}' ya existe, no se crea de nuevo.`);
      }
    }

    console.log('✅ Departamentos iniciales listos.');
  }



}