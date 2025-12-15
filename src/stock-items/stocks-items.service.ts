import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StockItem } from './stock-item.entity';
import { Department } from '../departments/department.entity';
import { Medication } from '../medications/medication.entity';
import { CreateStockItemDto } from './dto/create-stock-item.dto';
import { UpdateStockItemDto } from './dto/update-stock-item.dto';

@Injectable()
export class StockItemsService {
  constructor(
    @InjectRepository(StockItem)
    private readonly stockItemsRepo: Repository<StockItem>,

    @InjectRepository(Department)
    private readonly departmentsRepo: Repository<Department>,

    @InjectRepository(Medication)
    private readonly medicationsRepo: Repository<Medication>,
  ) {}

  /**
   * Create a new stock item for a medication in a department
   */
  async create(
    departmentId: string,
    medicationId: string,
    quantity: number = 0,
  ) {
    const [department, medication] = await Promise.all([
      this.departmentsRepo.findOne({ where: { id: departmentId } }),
      this.medicationsRepo.findOne({ where: { id: medicationId } }),
    ]);

    if (!department) {
      throw new NotFoundException('Department not found');
    }

    if (!medication) {
      throw new NotFoundException('Medication not found');
    }

    // Check if stock item already exists
    const exists = await this.stockItemsRepo.findOne({
      where: { department: { id: departmentId }, medication: { id: medicationId } },
    });

    if (exists) {
      throw new BadRequestException(
        'Stock item for this medication already exists in this department',
      );
    }

    const stockItem = this.stockItemsRepo.create({
      department,
      medication,
      quantity,
      minThreshold: 0,
      maxThreshold: 1000,
    });

    return this.stockItemsRepo.save(stockItem);
  }

  /**
   * Update thresholds for a specific medication in a specific department
   * ✅ This is the main method for threshold management
   */
  async updateThresholds(dto: UpdateStockItemDto) {
    const { departmentId, medicationId, minThreshold, maxThreshold } = dto;

    // Find the stock item
    const stockItem = await this.stockItemsRepo.findOne({
      where: {
        department: { id: departmentId },
        medication: { id: medicationId },
      },
      relations: ['medication', 'department'],
    });

    if (!stockItem) {
      throw new NotFoundException(
        `No stock item found for medication "${medicationId}" in department "${departmentId}"`,
      );
    }

    // Validate thresholds if both are provided
    if (minThreshold !== undefined && maxThreshold !== undefined) {
      if (minThreshold > maxThreshold) {
        throw new BadRequestException(
          `Min threshold (${minThreshold}) cannot be greater than max threshold (${maxThreshold})`,
        );
      }
    }

    // Validate individual values
    if (minThreshold !== undefined) {
      if (minThreshold < 0) {
        throw new BadRequestException('Min threshold cannot be negative');
      }
      // Check against existing maxThreshold
      if (minThreshold > stockItem.maxThreshold) {
        throw new BadRequestException(
          `Min threshold (${minThreshold}) cannot exceed current max threshold (${stockItem.maxThreshold})`,
        );
      }
      stockItem.minThreshold = minThreshold;
    }

    if (maxThreshold !== undefined) {
      if (maxThreshold < 0) {
        throw new BadRequestException('Max threshold cannot be negative');
      }
      // Check against existing minThreshold
      if (maxThreshold < stockItem.minThreshold) {
        throw new BadRequestException(
          `Max threshold (${maxThreshold}) cannot be less than current min threshold (${stockItem.minThreshold})`,
        );
      }
      stockItem.maxThreshold = maxThreshold;
    }

    return this.stockItemsRepo.save(stockItem);
  }

  /**
   * Get all stock items for a department
   */
  async findByDepartment(departmentId: string) {
    return this.stockItemsRepo.find({
      where: { department: { id: departmentId } },
      relations: ['medication', 'department'],
      order: { medication: { name: 'ASC' } },
    });
  }

  /**
   * Get all stock items for a medication across all departments
   */
  async findByMedication(medicationId: string) {
    return this.stockItemsRepo.find({
      where: { medication: { id: medicationId } },
      relations: ['medication', 'department'],
      order: { department: { name: 'ASC' } },
    });
  }

  /**
   * Get a specific stock item by department and medication
   */
  async findByDepartmentAndMedication(
    departmentId: string,
    medicationId: string,
  ) {
    const stockItem = await this.stockItemsRepo.findOne({
      where: {
        department: { id: departmentId },
        medication: { id: medicationId },
      },
      relations: ['medication', 'department'],
    });

    if (!stockItem) {
      throw new NotFoundException(
        `Stock item not found for medication in department`,
      );
    }

    return stockItem;
  }

  /**
   * Get all stock items
   */
  async findAll() {
    return this.stockItemsRepo.find({
      relations: ['medication', 'department'],
      order: { department: { name: 'ASC' }, medication: { name: 'ASC' } },
    });
  }

  /**
   * Get stock items that are below minimum threshold (Alert status)
   */
  async findBelowMinThreshold(departmentId?: string) {
    let query = this.stockItemsRepo.createQueryBuilder('s')
      .where('s.quantity < s.minThreshold')
      .leftJoinAndSelect('s.medication', 'medication')
      .leftJoinAndSelect('s.department', 'department');

    if (departmentId) {
      query = query.andWhere('s.department.id = :departmentId', { departmentId });
    }

    return query.orderBy('s.department.name', 'ASC')
      .addOrderBy('s.medication.name', 'ASC')
      .getMany();
  }

  /**
   * Get stock items that are above maximum threshold
   */
  async findAboveMaxThreshold(departmentId?: string) {
    let query = this.stockItemsRepo.createQueryBuilder('s')
      .where('s.quantity > s.maxThreshold')
      .leftJoinAndSelect('s.medication', 'medication')
      .leftJoinAndSelect('s.department', 'department');

    if (departmentId) {
      query = query.andWhere('s.department.id = :departmentId', { departmentId });
    }

    return query.orderBy('s.department.name', 'ASC')
      .addOrderBy('s.medication.name', 'ASC')
      .getMany();
  }

  /**
   * Update quantity (e.g., after a delivery or usage)
   */
  async updateQuantity(departmentId: string, medicationId: string, newQuantity: number) {
    const stockItem = await this.findByDepartmentAndMedication(
      departmentId,
      medicationId,
    );

    if (newQuantity < 0) {
      throw new BadRequestException('Quantity cannot be negative');
    }

    stockItem.quantity = newQuantity;
    return this.stockItemsRepo.save(stockItem);
  }

  /**
   * Get threshold status for a stock item
   */
  getThresholdStatus(stockItem: StockItem): 'critical' | 'low' | 'normal' | 'high' {
    const { quantity, minThreshold, maxThreshold } = stockItem;

    if (quantity < minThreshold) return 'critical';
    if (quantity > maxThreshold) return 'high';
    if (quantity <= minThreshold + Math.ceil((minThreshold * 0.2))) return 'low'; // 20% above min
    return 'normal';
  }
}