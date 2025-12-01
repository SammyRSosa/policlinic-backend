import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StockItem } from './stock-item.entity';
import { Department } from '../departments/department.entity';
import { Medication } from '../medications/medication.entity'; // ✅ Nueva import

@Injectable()
export class StockItemsService {
  constructor(
    @InjectRepository(StockItem)
    private itemsRepo: Repository<StockItem>,
    @InjectRepository(Department)
    private departmentsRepo: Repository<Department>,
    @InjectRepository(Medication) // ✅ Agregar repositorio de Medication
    private medicationsRepo: Repository<Medication>,
  ) {}

  // ✅ CAMBIAR: Recibir medicationId en lugar de medicationName
  async create(departmentId: string, medicationId: string, quantity = 0) {
    const department = await this.departmentsRepo.findOne({ 
      where: { id: departmentId } 
    });
    if (!department) throw new NotFoundException('Department not found');

    const medication = await this.medicationsRepo.findOne({
      where: { id: medicationId }
    });
    if (!medication) throw new NotFoundException('Medication not found');

    const item = this.itemsRepo.create({ 
      department,
      medication, // ✅ Usar la relación con Medication
      quantity 
    });
    return this.itemsRepo.save(item);
  }

  async findAll() {
    return this.itemsRepo.find({ 
      relations: ['department', 'medication'] // ✅ Agregar relación medication
    });
  }

  async findByDepartment(departmentId: string) {
    return this.itemsRepo.find({ 
      where: { department: { id: departmentId } },
      relations: ['department', 'medication'] // ✅ Agregar relación medication
    });
  }

  async findByMedication(medicationId: string) {
    return this.itemsRepo.find({
      where: { medication: { id: medicationId } },
      relations: ['department', 'medication']
    });
  }

  async updateQuantity(itemId: string, quantity: number) {
    const item = await this.itemsRepo.findOne({ 
      where: { id: itemId },
      relations: ['medication'] 
    });
    if (!item) throw new NotFoundException('Stock item not found');
    item.quantity = quantity;
    return this.itemsRepo.save(item);
  }

  // ✅ NUEVO: Buscar stock items por departamento y medicamento
  async findByDepartmentAndMedication(departmentId: string, medicationId: string) {
    return this.itemsRepo.findOne({
      where: { 
        department: { id: departmentId },
        medication: { id: medicationId }
      },
      relations: ['department', 'medication']
    });
  }
}