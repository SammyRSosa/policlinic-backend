import { Controller, Get, Param, Patch, Delete, Body, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { Roles } from '../auth/roles.decorator';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../auth/roles.guard';
import { UserRole } from './user.entity';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Get all users
  @Get()
  @Roles(UserRole.ADMIN)
  findAll() {
    return this.usersService.findAll();
  }

  // Get one user by ID
  @Get(':id')
  @Roles(UserRole.ADMIN)
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  // Update user role
  @Patch(':id/role')
  @Roles(UserRole.ADMIN)
  updateRole(@Param('id') id: string, @Body('role') role: UserRole) {
    return this.usersService.updateRole(id, role);
  }

  // Delete user
  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
