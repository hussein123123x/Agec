import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from '../../core/decorators/public.decorator'; 


@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @Public()
  async login(@Body() body: { email: string; password: string }) {
    console.log("🚀 ~ AuthController ~ login ~ body.email:", body.email)
    console.log("🚀 ~ AuthController ~ login ~ body.password:", body.password)
    return this.authService.login(body.email, body.password);
  }

  @Post('forget-password')
  @Public()
  async forgetPassword(@Body() body: { email: string }) {
    return this.authService.forgetPassword(body.email);
  }

  @Post('update-password')
  @Public()
  async updatePassword(@Body() body: { email: string, newPassword: string }) {
    return this.authService.updatePassword(body.email, body.newPassword);
  }
}
