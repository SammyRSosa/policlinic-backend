// medications.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Medication } from './medication.entity';
import { Department } from 'src/departments/department.entity';
import { StockItem } from 'src/stock-items/stock-item.entity';

@Injectable()
export class MedicationsService {
  constructor(
    @InjectRepository(Medication)
    private medicationsRepo: Repository<Medication>,

    @InjectRepository(Department)
    private departmentsRepo: Repository<Department>,

    @InjectRepository(StockItem)
    private stockItemsRepo: Repository<StockItem>,
  ) { }

  async create(dto: {
    name: string;
    code?: string;
    description?: string;
    unit?: string;
  }) {
    const existing = await this.medicationsRepo.findOne({
      where: { name: dto.name },
    });
    if (existing) {
      throw new BadRequestException(`Medication "${dto.name}" already exists`);
    }

    // 1️⃣ Create medication
    const medication = await this.medicationsRepo.save(
      this.medicationsRepo.create(dto),
    );

    // 2️⃣ Create stock items for every department
    const departments = await this.departmentsRepo.find();

    const stockItems = departments.map((department) =>
      this.stockItemsRepo.create({
        medication,
        department,
        quantity: 0,
      }),
    );

    await this.stockItemsRepo.save(stockItems);

    return medication;
  }


  async findAll() {
    return this.medicationsRepo.find({
      relations: ['prescriptions', 'stockItems'],
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string) {
    const medication = await this.medicationsRepo.findOne({
      where: { id },
      relations: ['prescriptions', 'stockItems'],
    });
    if (!medication) throw new NotFoundException('Medication not found');
    return medication;
  }

  async findByName(name: string) {
    const medication = await this.medicationsRepo.findOne({
      where: { name },
      relations: ['prescriptions', 'stockItems'],
    });
    if (!medication) throw new NotFoundException('Medication not found');
    return medication;
  }

  async update(
    id: string,
    dto: { name?: string; code?: string; description?: string; unit?: string },
  ) {
    const medication = await this.findOne(id);

    // Check if new name already exists
    if (dto.name && dto.name !== medication.name) {
      const existing = await this.medicationsRepo.findOne({
        where: { name: dto.name },
      });
      if (existing) {
        throw new BadRequestException(
          `Medication "${dto.name}" already exists`,
        );
      }
    }

    Object.assign(medication, dto);
    return this.medicationsRepo.save(medication);
  }

  async delete(id: string) {
    const medication = await this.findOne(id);

    // Check if medication is being used in prescriptions
    if (medication.prescriptions && medication.prescriptions.length > 0) {
      throw new BadRequestException(
        `Cannot delete medication with ${medication.prescriptions.length} active prescription(s)`,
      );
    }

    await this.medicationsRepo.remove(medication);
    return { message: 'Medication deleted successfully' };
  }

  async search(query: string) {
    return this.medicationsRepo
      .createQueryBuilder('medication')
      .where('medication.name ILIKE :query', { query: `%${query}%` })
      .orWhere('medication.code ILIKE :query', { query: `%${query}%` })
      .orWhere('medication.description ILIKE :query', {
        query: `%${query}%`,
      })
      .orderBy('medication.name', 'ASC')
      .getMany();
  }

  async getByDepartment(departmentId: string) {
    return this.medicationsRepo
      .createQueryBuilder('medication')
      .leftJoinAndSelect('medication.stockItems', 'stockItem')
      .leftJoinAndSelect('stockItem.department', 'department')
      .where('department.id = :departmentId', { departmentId })
      .orderBy('medication.name', 'ASC')
      .getMany();
  }
}