import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Department } from '../departments/department.entity';
import { Medication } from '../medications/medication.entity';

@Entity('stock_items')
export class StockItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('int', { default: 0 })
  quantity: number;

  @Column('int', { default: 0 })
  minThreshold: number;

  @Column('int', { default: 1000 })
  maxThreshold: number;

  @ManyToOne(() => Medication, (medication) => medication.stockItems, {
    nullable: false,
    eager: true // Para cargar automáticamente la medicación
  })
  medication: Medication;

  @ManyToOne(() => Department, (department) => department.stockItems, {
    nullable: false,
    onDelete: 'CASCADE'
  })
  department: Department;
}
