// src/auth/jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET || 'ccf52bb593d2a5f3fb1cc1eb3a9129073bda116b50b9363cebde531d1b42af4a78dafc87f85905d69bc3e478ea12a76f19caff9bd38c7651a2b3676c907db830',
    });
  }

  async validate(payload: any) {
    return { id: payload.sub, role: payload.role };
  }
}
