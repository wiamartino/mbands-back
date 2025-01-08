import { Controller, Request, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import * as bcrypt from 'bcrypt';
import { User } from 'src/users/entities/user.entity';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req) {

    // const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const validatedUser = await this.authService.validateUser(req.body.username, req.body.password);
    return this.authService.login(validatedUser);
  }
  
  @Post('register')
  async register(@Request() req): Promise<any> {
    return this.authService.register(req.body.username, req.body.password, req.body.email);
  }


}