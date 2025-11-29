// src/auth/jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET || 'ccf52bb593d2a5f3fb1cc1eb3a9129073bda116b50b9363cebde531d1b42af4a78dafc87f85905d69bc3e478ea12a76f19caff9bd38c7651a2b3676c907db830',
    });
  }

  async validate(payload: any) {
    const user = await this.userRepo.findOne({
      where: { id: payload.sub },
      relations: ['patient', 'worker'],
    });
    return { id: payload.sub, role: payload.role, patient: user?.patient, worker: user?.worker };
  }
}
