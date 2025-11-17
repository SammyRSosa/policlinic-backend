import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { Worker } from '../workers/worker.entity';
import { Patient } from '../patients/patient.entity';

import * as bcrypt from 'bcrypt';
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

// Mock de bcrypt
jest.mock('bcrypt');

// Repositorios mockeados
const mockRepo = () => ({
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
});

describe('AuthService - Unit Tests', () => {
  let service: AuthService;
  let userRepo: any;
  let workerRepo: any;
  let patientRepo: any;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useFactory: mockRepo },
        { provide: getRepositoryToken(Worker), useFactory: mockRepo },
        { provide: getRepositoryToken(Patient), useFactory: mockRepo },
        {
          provide: JwtService,
          useValue: { sign: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepo = module.get(getRepositoryToken(User));
    workerRepo = module.get(getRepositoryToken(Worker));
    patientRepo = module.get(getRepositoryToken(Patient));
    jwtService = module.get(JwtService);

    jest.clearAllMocks();
  });

  // =====================================
  // REGISTER
  // =====================================
  describe('register', () => {
    it('❌ debe lanzar BadRequest si el user ya existe', async () => {
      userRepo.findOne.mockResolvedValue({ id: 1 });

      await expect(service.register('123', 'pass'))
        .rejects
        .toThrow(BadRequestException);
    });

    it('❌ debe lanzar NotFound si no existe ni paciente ni worker', async () => {
      userRepo.findOne.mockResolvedValue(null);
      patientRepo.findOne.mockResolvedValue(null);
      workerRepo.findOne.mockResolvedValue(null);

      await expect(service.register('555', '123'))
        .rejects
        .toThrow(NotFoundException);
    });

    it('✔ debe registrar un paciente y asignar role PATIENT', async () => {
      userRepo.findOne.mockResolvedValue(null);

      patientRepo.findOne.mockResolvedValue({ id: 1 });
      workerRepo.findOne.mockResolvedValue(null);

      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed123');

      userRepo.create.mockReturnValue({ username: 'p1' });
      userRepo.save.mockResolvedValue({ id: 10, username: 'p1' });

      const result = await service.register('999', 'pass');

      expect(bcrypt.hash).toHaveBeenCalledWith('pass', 10);
      expect(userRepo.create).toHaveBeenCalled();
      expect(userRepo.save).toHaveBeenCalled();
      expect(result).toEqual({ id: 10, username: 'p1' });
    });

    it('✔ debe registrar un worker y mapear role doctor → DOCTOR', async () => {
      userRepo.findOne.mockResolvedValue(null);

      patientRepo.findOne.mockResolvedValue(null);
      workerRepo.findOne.mockResolvedValue({ code: '123', role: 'doctor' });

      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');

      userRepo.create.mockReturnValue({ username: 'w1' });
      userRepo.save.mockResolvedValue({ id: 22, username: 'w1' });

      const result = await service.register('777', 'abc');

      expect(result).toEqual({ id: 22, username: 'w1' });
    });

    it('✔ debe mapear role admin → ADMIN', async () => {
      userRepo.findOne.mockResolvedValue(null);

      patientRepo.findOne.mockResolvedValue(null);
      workerRepo.findOne.mockResolvedValue({ role: 'admin' });

      (bcrypt.hash as jest.Mock).mockResolvedValue('hashxx');

      userRepo.create.mockReturnValue({ username: 'admin' });
      userRepo.save.mockResolvedValue({ id: 50, username: 'admin' });

      const result = await service.register('A1', 'abc');
      expect(result.id).toBe(50);
    });
  });

  // =====================================
  // LOGIN
  // =====================================
  describe('login', () => {
    it('❌ debe lanzar Unauthorized si user no existe', async () => {
      userRepo.findOne.mockResolvedValue(null);

      await expect(service.login('u', 'p'))
        .rejects
        .toThrow(UnauthorizedException);
    });

    it('❌ debe lanzar Unauthorized si password es incorrecto', async () => {
      userRepo.findOne.mockResolvedValue({
        username: 'u',
        password: 'hashed',
      });

      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login('u', 'p'))
        .rejects
        .toThrow(UnauthorizedException);
    });

    it('✔ debe retornar token válido con role', async () => {
      userRepo.findOne.mockResolvedValue({
        id: 1,
        username: 'test',
        password: 'hashed',
        role: 'doctor',
      });

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwtService.sign as jest.Mock).mockReturnValue('jwt_token');

      const resp = await service.login('test', '12345');

      expect(jwtService.sign).toHaveBeenCalled();
      expect(resp).toEqual({
        access_token: 'jwt_token',
        role: 'doctor',
      });
    });
  });
});
