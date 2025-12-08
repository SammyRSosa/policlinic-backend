import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MedicationOrder, MedicationOrderStatus } from './medication-order.entity';
import { MedicationOrderItem } from '../medication-order-items/medication-order-item.entity';
import { Department } from '../departments/department.entity';
import { HeadOfDepartment } from '../heads-of-departments/head-of-department.entity';
import { Medication } from '../medications/medication.entity';
import { StockItem } from '../stock-items/stock-item.entity';
import { MedicationDelivery, DeliveryStatus } from '../medication-deliveries/medication-delivery.entity';
import { MedicationDeliveryItem } from '../medication-deliveries-items/medication-delivery-item.entity';

@Injectable()
export class MedicationOrdersService {
  constructor(
    @InjectRepository(MedicationOrder)
    private ordersRepo: Repository<MedicationOrder>,

    @InjectRepository(MedicationOrderItem)
    private orderItemsRepo: Repository<MedicationOrderItem>,

    @InjectRepository(Department)
    private departmentsRepo: Repository<Department>,

    @InjectRepository(HeadOfDepartment)
    private headsRepo: Repository<HeadOfDepartment>,

    @InjectRepository(Medication)
    private medicationsRepo: Repository<Medication>,

    @InjectRepository(StockItem)
    private stockItemsRepo: Repository<StockItem>,

    @InjectRepository(MedicationDelivery)
    private deliveriesRepo: Repository<MedicationDelivery>,

    @InjectRepository(MedicationDeliveryItem)
    private deliveryItemsRepo: Repository<MedicationDeliveryItem>,
  ) {}

  async create(
    departmentId: string,
    headId: string,
    requestedItems: { medicationId: string; quantity: number }[],
  ) {
    if (!departmentId) {
      throw new BadRequestException('Department ID and Head ID are required');
    }

    if (!requestedItems || requestedItems.length === 0) {
      throw new BadRequestException('At least one medication item is required');
    }

    // Verify department exists
    const department = await this.departmentsRepo.findOne({
      where: { id: departmentId },
    });
    if (!department) throw new NotFoundException('Department not found');

    // Verify head exists
    const head = await this.headsRepo.findOne({ where: { id: headId } });
    if (!head) throw new NotFoundException('Head of Department not found');

    // Verify all medications exist and cache them
    const medicationsMap = new Map<string, Medication>();
    
    for (const item of requestedItems) {
      if (!item.medicationId || item.quantity <= 0) {
        throw new BadRequestException(
          'Invalid medication ID or quantity for item',
        );
      }

      const medication = await this.medicationsRepo.findOne({
        where: { id: item.medicationId },
      });
      
      if (!medication) {
        throw new NotFoundException(
          `Medication ${item.medicationId} not found`,
        );
      }

      medicationsMap.set(item.medicationId, medication);
    }

    // Create order
    const order = this.ordersRepo.create({
      department: department,
      head: head,
      status: MedicationOrderStatus.PENDING,
    });
    const savedOrder = await this.ordersRepo.save(order);

    // Create order items
    for (const itemData of requestedItems) {
      const medication = medicationsMap.get(itemData.medicationId);
      
      if (!medication) {
        throw new NotFoundException(
          `Medication ${itemData.medicationId} not found`,
        );
      }

      const orderItem = new MedicationOrderItem();
      orderItem.medicationOrder = savedOrder;
      orderItem.medication = medication;
      orderItem.quantity = itemData.quantity;

      await this.orderItemsRepo.save(orderItem);
    }

    return this.findOne(savedOrder.id);
  }

  async findAll() {
    return this.ordersRepo.find({
      relations: ['department', 'head', 'items', 'items.medication'],
      order: { requestedAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const order = await this.ordersRepo.findOne({
      where: { id },
      relations: ['department', 'head', 'items', 'items.medication'],
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async respond(orderId: string, accept: boolean) {
    const order = await this.findOne(orderId);

    order.status = accept
      ? MedicationOrderStatus.ACCEPTED
      : MedicationOrderStatus.DENIED;
    order.respondedAt = new Date();

    if (accept) {
      // Create medication delivery
      const delivery = this.deliveriesRepo.create({
        department: order.department,
        status: DeliveryStatus.PENDING,
      });
      const savedDelivery = await this.deliveriesRepo.save(delivery);

      // Get Almacén department
      const almacenDept = await this.departmentsRepo.findOne({
        where: { name: 'Almacén' },
      });

      if (!almacenDept) {
        throw new NotFoundException('Almacén department not found');
      }

      // Process each item in the order
      for (const orderItem of order.items) {
        const medication = orderItem.medication;
        const requestedQuantity = orderItem.quantity;

        // Step 1: Deduct from ALMACEN stock
        let almacenStock = await this.stockItemsRepo.findOne({
          where: {
            medication: { id: medication.id },
            department: { id: almacenDept.id },
          },
        });

        if (!almacenStock || almacenStock.quantity < requestedQuantity) {
          throw new BadRequestException(
            `Insufficient stock in Almacén for ${medication.name}. Available: ${
              almacenStock?.quantity || 0
            }, Requested: ${requestedQuantity}`,
          );
        }

        // Deduct from almacen
        almacenStock.quantity -= requestedQuantity;
        if (almacenStock.quantity === 0) {
          await this.stockItemsRepo.remove(almacenStock);
        } else {
          await this.stockItemsRepo.save(almacenStock);
        }

        // Step 2: Add to requesting department stock
        let deptStock = await this.stockItemsRepo.findOne({
          where: {
            medication: { id: medication.id },
            department: { id: order.department.id },
          },
        });

        if (deptStock) {
          // Add to existing stock
          deptStock.quantity += requestedQuantity;
          await this.stockItemsRepo.save(deptStock);
        } else {
          // Create new stock entry
          const newDeptStock = new StockItem();
          newDeptStock.medication = medication;
          newDeptStock.department = order.department;
          newDeptStock.quantity = requestedQuantity;
          await this.stockItemsRepo.save(newDeptStock);
        }

        // Step 3: Create delivery item
        const deliveryItem = new MedicationDeliveryItem();
        deliveryItem.medicationDelivery = savedDelivery;
        deliveryItem.medication = medication;
        deliveryItem.quantity = requestedQuantity;
        await this.deliveryItemsRepo.save(deliveryItem);
      }
    }

    return this.ordersRepo.save(order);
  }
}