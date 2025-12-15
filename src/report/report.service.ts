// 📁 reports.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Consultation } from '../consultations/consultation.entity';
import { Medication } from '../medications/medication.entity';
import { StockItem } from '../stock-items/stock-item.entity';
import { Remission } from '../remissions/remission.entity';
import { Patient } from '../patients/patient.entity';
import { Worker } from '../workers/worker.entity';
import { Department } from '../departments/department.entity';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Consultation)
    private consultationsRepo: Repository<Consultation>,
    @InjectRepository(Medication)
    private medicationsRepo: Repository<Medication>,
    @InjectRepository(StockItem)
    private stockItemsRepo: Repository<StockItem>,
    @InjectRepository(Remission)
    private remissionsRepo: Repository<Remission>,
    @InjectRepository(Patient)
    private patientsRepo: Repository<Patient>,
    @InjectRepository(Worker)
    private workersRepo: Repository<Worker>,
    @InjectRepository(Department)
    private departmentsRepo: Repository<Department>,
  ) { }

  // ===== CONSULTATIONS REPORT =====
  async getConsultationsReport(
    departmentId?: string,
    startDate?: Date,
    endDate?: Date,
    status?: string,
  ) {
    const query = this.consultationsRepo.createQueryBuilder('c');

    // Base relations
    query.leftJoinAndSelect('c.mainDoctor', 'mainDoctor');
    query.leftJoinAndSelect('c.department', 'department');
    query.leftJoinAndSelect('c.prescriptions', 'prescriptions');
    query.leftJoinAndSelect('prescriptions.medication', 'medication');

    // Emergency consultations
    query.leftJoinAndSelect('c.patient', 'patient');

    // Programmed consultations (child entity fields)
    query.leftJoinAndSelect('c.internalRemission', 'internalRemission');
    query.leftJoinAndSelect(
      'internalRemission.patient',
      'internalRemissionPatient',
    );

    query.leftJoinAndSelect('c.externalRemission', 'externalRemission');
    query.leftJoinAndSelect(
      'externalRemission.patient',
      'externalRemissionPatient',
    );

    // Filters
    if (departmentId) {
      query.andWhere('c.departmentId = :departmentId', { departmentId });
    }

    if (status) {
      query.andWhere('c.status = :status', { status });
    }

    if (startDate && endDate) {
      query.andWhere('c.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    query.orderBy('c.createdAt', 'DESC');

    const consultations = await query.getMany();

    // 🔒 Normalize patient for frontend & reports
    consultations.forEach((c: any) => {
      c.patient =
        c.patient ??
        c.internalRemission?.patient ??
        c.externalRemission?.patient;
    });

    return {
      type: 'consultations',
      total: consultations.length,
      closed: consultations.filter((c) => c.status === 'closed').length,
      pending: consultations.filter((c) => c.status === 'pending').length,
      canceled: consultations.filter((c) => c.status === 'canceled').length,
      data: consultations,
      generatedAt: new Date(),
    };
  }

  async getMonthlyMedicationConsumption(
    medicationId: string,
    month: string,
  ) {
    const raw = await this.consultationsRepo.query(
      `
      SELECT
        d.id AS "departmentId",
        d.name AS "departmentName",
        SUM(cp.quantity) AS "totalConsumed",
        si.quantity AS "currentStock",
        si."minThreshold",
        si."maxThreshold"
      FROM consultation_prescriptions cp
      JOIN consultations c ON c.id = cp."consultationId"
      JOIN departments d ON d.id = c."departmentId"
      JOIN stock_items si
        ON si."departmentId" = d.id
       AND si."medicationId" = cp."medicationId"
      WHERE cp."medicationId" = $1
        AND DATE_TRUNC('month', c."createdAt") = DATE_TRUNC('month', $2::date)
      GROUP BY
        d.id, d.name, si.quantity, si."minThreshold", si."maxThreshold"
      `,
      [medicationId, month],
    );

    return raw.map((row) => ({
      ...row,
      status:
        row.currentStock < row.minThreshold
          ? 'CRITICAL'
          : row.currentStock > row.maxThreshold
            ? 'OVERSTOCK'
            : 'OK',
    }));
  }
  // ===== MEDICATIONS/STOCK REPORT =====
  async getMedicationsReport(departmentId?: string) {
    let stockItems: any[] = [];

    if (departmentId) {
      stockItems = await this.stockItemsRepo.find({
        where: { department: { id: departmentId } },
        relations: ['medication', 'department'],
      });
    } else {
      stockItems = await this.stockItemsRepo.find({
        relations: ['medication', 'department'],
      });
    }

    const totalQuantity = stockItems.reduce((sum, item) => sum + item.quantity, 0);
    const lowStockItems = stockItems.filter((item) => item.quantity < 10);

    return {
      type: 'medications',
      total: stockItems.length,
      lowStock: lowStockItems.length,
      totalQuantity,
      data: stockItems,
      generatedAt: new Date(),
    };
  }

  // ===== REMISSIONS REPORT =====
  async getRemissionsReport(
    departmentId?: string,
    startDate?: Date,
    endDate?: Date,
  ) {
    const query = this.remissionsRepo.createQueryBuilder('r');

    query.leftJoinAndSelect('r.patient', 'patient');
    query.leftJoinAndSelect('r.toDepartment', 'toDepartment');
    query.leftJoinAndSelect('r.medicalPost', 'medicalPost');
    query.leftJoinAndSelect('r.consultation', 'consultation');

    if (departmentId) {
      query.andWhere('r.toDepartmentId = :departmentId', {
        departmentId,
      });
    }

    if (startDate && endDate) {
      query.andWhere('r.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    query.orderBy('r.createdAt', 'DESC');
    const remissions = await query.getMany();

    const internal = remissions.filter((r: any) => r.type === 'internal');
    const external = remissions.filter((r: any) => r.type === 'external' || r.medicalPost);
    const withConsultation = remissions.filter((r) => r.consultation);

    return {
      type: 'remissions',
      total: remissions.length,
      internal: internal.length,
      external: external.length,
      withConsultation: withConsultation.length,
      data: remissions,
      generatedAt: new Date(),
    };
  }

  // ===== PATIENTS REPORT =====
  async getPatientsReport(departmentId?: string) {
    let patients: any[] = [];

    if (departmentId) {
      // Obtener pacientes a través de ClinicHistory que están asociados a consultas en ese departamento
      const consultations = await this.consultationsRepo.find({
        where: { department: { id: departmentId } },
        relations: ['clinicHistory', 'clinicHistory.patient'],
      });

      const patientIds = [
        ...new Set(
          consultations
            .map((c) => c.clinicHistory?.patient?.id)
            .filter(Boolean)
        ),
      ];

      if (patientIds.length > 0) {
        patients = await this.patientsRepo.findByIds(patientIds);
      }
    } else {
      patients = await this.patientsRepo.find();
    }

    return {
      type: 'patients',
      total: patients.length,
      data: patients,
      generatedAt: new Date(),
    };
  }

  // ===== PERSONNEL REPORT =====
  async getPersonnelReport(departmentId?: string) {
    let workers: any[] = [];

    if (departmentId) {
      workers = await this.workersRepo.find({
        where: { department: { id: departmentId }, active: true },
        relations: ['department'],
      });
    } else {
      workers = await this.workersRepo.find({
        where: { active: true },
        relations: ['department'],
      });
    }

    const doctors = workers.filter((w) => w.role === 'doctor');
    const nurses = workers.filter((w) => w.role === 'nurse');

    return {
      type: 'personnel',
      total: workers.length,
      doctors: doctors.length,
      nurses: nurses.length,
      data: workers,
      generatedAt: new Date(),
    };
  }

  // ===== DEPARTMENTS SUMMARY =====
  async getDepartmentsSummary() {
    const departments = await this.departmentsRepo.find({
      relations: ['workers', 'headOfDepartment', 'headOfDepartment.worker'],
    });

    const summary = await Promise.all(
      departments.map(async (dept) => {
        const consultations = await this.consultationsRepo.count({
          where: { department: { id: dept.id } },
        });
        const stockItems = await this.stockItemsRepo.count({
          where: { department: { id: dept.id } },
        });

        return {
          id: dept.id,
          name: dept.name,
          head: dept.headOfDepartment?.worker
            ? `${dept.headOfDepartment.worker.firstName} ${dept.headOfDepartment.worker.lastName}`
            : 'Sin asignar',
          personnel: dept.workers?.length || 0,
          consultations,
          medicationTypes: stockItems,
        };
      }),
    );

    return {
      type: 'departments_summary',
      total: departments.length,
      data: summary,
      generatedAt: new Date(),
    };
  }


  async getMedicationConsumptionByDepartment(
    departmentId?: string,
    month?: string,
  ) {
    const params: any[] = [];
    let whereClause = '';

    if (month) {
      whereClause += ` AND DATE_TRUNC('month', c."createdAt") = DATE_TRUNC('month', $${params.length + 1}::date)`;
      params.push(month);
    }

    if (departmentId) {
      whereClause += ` AND d.id = $${params.length + 1}`;
      params.push(departmentId);
    }

    const raw = await this.consultationsRepo.query(
      `
    SELECT
      d.id AS "departmentId",
      d.name AS "departmentName",
      m.id AS "medicationId",
      m.name AS "medicationName",
      SUM(cp.quantity) AS "totalConsumed",
      si.quantity AS "currentStock",
      si."minThreshold",
      si."maxThreshold"
    FROM consultation_prescriptions cp
    JOIN consultations c ON c.id = cp."consultationId"
    JOIN departments d ON d.id = c."departmentId"
    JOIN medications m ON m.id = cp."medicationId"
    LEFT JOIN stock_items si
      ON si."departmentId" = d.id
     AND si."medicationId" = m.id
    WHERE 1=1
      ${whereClause}
    GROUP BY d.id, d.name, m.id, m.name, si.quantity, si."minThreshold", si."maxThreshold"
    ORDER BY d.name, m.name
    `,
      params, // <- pass as array of separate values
    );

    return raw.map((row) => ({
      ...row,
      status:
        row.currentStock < row.minThreshold
          ? 'CRITICAL'
          : row.currentStock > row.maxThreshold
            ? 'OVERSTOCK'
            : 'OK',
    }));
  }

}