// 📁 reports.controller.ts
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ReportsService } from './report.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/user.entity';

@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.HEAD_OF_DEPARTMENT)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  // ===== CONSULTATIONS REPORT =====
  @Get('consultations')
  async getConsultationsReport(
    @Query('departmentId') departmentId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('status') status?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;

    return this.reportsService.getConsultationsReport(
      departmentId,
      start,
      end,
      status,
    );
  }

  // ===== MEDICATIONS REPORT =====
  @Get('medications')
  async getMedicationsReport(@Query('departmentId') departmentId?: string) {
    return this.reportsService.getMedicationsReport(departmentId);
  }

  // ===== REMISSIONS REPORT =====
  @Get('remissions')
  async getRemissionsReport(
    @Query('departmentId') departmentId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;

    return this.reportsService.getRemissionsReport(departmentId, start, end);
  }

  // ===== PATIENTS REPORT =====
  @Get('patients')
  async getPatientsReport(@Query('departmentId') departmentId?: string) {
    return this.reportsService.getPatientsReport(departmentId);
  }

  // ===== PERSONNEL REPORT =====
  @Get('personnel')
  async getPersonnelReport(@Query('departmentId') departmentId?: string) {
    return this.reportsService.getPersonnelReport(departmentId);
  }

  // ===== DEPARTMENTS SUMMARY =====
  @Get('departments-summary')
  async getDepartmentsSummary() {
    return this.reportsService.getDepartmentsSummary();
  }
}

