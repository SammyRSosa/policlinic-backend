import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() body: { account: string; password: string }) {
    return this.authService.register(body.account, body.password);
  }

  @Post('login')
  login(@Body() body: { account: string; password: string }) {
    return this.authService.login(body.account, body.password);
  }
}
