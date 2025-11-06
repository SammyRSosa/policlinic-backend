import { Injectable, BadRequestException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../users/user.entity';
import { Worker } from '../workers/worker.entity';
import { Patient } from '../patients/patient.entity';
import { UserRole } from '../users/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Worker) private workerRepo: Repository<Worker>,
    @InjectRepository(Patient) private patientRepo: Repository<Patient>,
    private jwtService: JwtService,
  ) {}

  // 🔹 Register existing worker or patient
  async register(account: string, password: string) {
    const existingUser = await this.userRepo.findOne({ where: { username: account } });
    if (existingUser)  throw new BadRequestException(`Account already registered for username: ${account}`);

    const patient = await this.patientRepo.findOne({ where: { idNumber: account } });
    const worker = await this.workerRepo.findOne({ where: { code: account }, relations: ['department'] });

    if (!patient && !worker) throw new NotFoundException('Account not found');

    const hashed = await bcrypt.hash(password, 10);

    // ✅ Safely map to the correct enum type
    let role: UserRole = UserRole.DOCTOR;
    if (patient) {
      role = UserRole.PATIENT;
    } else if (worker) {
      switch (worker.role) {
        case 'admin':
          role = UserRole.ADMIN;
          break;
        case 'head_of_department':
          role = UserRole.HEAD_OF_DEPARTMENT;
          break;
        case 'doctor':
          role = UserRole.DOCTOR;
          break;
        default:
          role = UserRole.DOCTOR; // fallback
      }
    }

    // ✅ Correct create() syntax
    const user = this.userRepo.create({
      username: account,
      password: hashed,
      role,
    });

    return this.userRepo.save(user);
  }

  // 🔹 Login
  async login(account: string, password: string) {
    const user = await this.userRepo.findOne({ where: { username: account } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    const payload = { username: user.username, role: user.role };
    const token = this.jwtService.sign(payload);

    return { access_token: token, role: user.role };
  }
}
