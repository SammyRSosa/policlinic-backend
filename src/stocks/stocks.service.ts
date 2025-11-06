import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Stock } from './stock.entity';
import { Medication } from 'src/medications/medication.entity';
import { Department } from 'src/departments/department.entity';

@Injectable()
export class StocksService {
  constructor(
    @InjectRepository(Stock)
    private stocksRepo: Repository<Stock>,
    @InjectRepository(Medication)
    private medicationsRepo: Repository<Medication>,
    @InjectRepository(Department)
    private departmentsRepo: Repository<Department>,
  ) { }

  async create(
    departmentId: string | null,
    medicationId: string,
    quantity = 0,
    minQuantity = 0,
    maxQuantity = 1000,
  ) {
    const medication = await this.medicationsRepo.findOne({ where: { id: medicationId } });
    if (!medication) throw new NotFoundException('Medication not found');

    let department: Department | undefined = undefined;
    if (departmentId) {
      const foundDepartment = await this.departmentsRepo.findOne({ where: { id: departmentId } });
      if (!foundDepartment) throw new NotFoundException('Department not found');
      department = foundDepartment;
    }

    const stock = this.stocksRepo.create({
      medication,
      department, // use undefined instead of null
      quantity,
      minQuantity,
      maxQuantity,
    });

    return this.stocksRepo.save(stock);
  }
  findAll() {
    return this.stocksRepo.find({ relations: ['medication', 'department'] });
  }

  async findOne(id: string) {
    const stock = await this.stocksRepo.findOne({ where: { id }, relations: ['medication', 'department'] });
    if (!stock) throw new NotFoundException('Stock not found');
    return stock;
  }

  async updateQuantity(id: string, quantity: number) {
    const stock = await this.findOne(id);
    if (quantity < 0) throw new BadRequestException('Quantity cannot be negative');
    stock.quantity = quantity;
    return this.stocksRepo.save(stock);
  }

  async remove(id: string) {
    const stock = await this.findOne(id);
    return this.stocksRepo.remove(stock);
  }
}
