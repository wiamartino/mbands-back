import { BadRequestException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
const jwt = require('jsonwebtoken');

@Injectable()
export class AuthService {
  constructor(private readonly userService: UsersService) {}

  async validateUser(username: string, password: string) {
    const user = await this.userService.findOne(username);
    if (!user) {
      return null;
    }

    let isMatch: boolean = false;
    
    if (password === user.password) {
      isMatch = true;
    } else {
      isMatch = await bcrypt.compare(password, user.password);
    }
    
    //const isMatch: boolean = password === user.password;
    //const isMatch: boolean = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      throw new BadRequestException('Password does not match');
    }
    return user;
  }

  async login(user: User) {
    const payload = { sub: user.userId, username: user.username, password: user.password ,email: user.email };
    return {
      access_token: this.generateToken(payload),
    };
  }

  async register(username: string, password: string, email: string) {
    const existingUser = await this.userService.findOne(username);
    if (existingUser) {
      throw new BadRequestException('User already exists');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser: User = { userId: 0, username, password: hashedPassword, email };
    const user = await this.userService.create(newUser);
    // await this.userService.save(user);
    return this.login(user);
  }

  private generateToken(payload: any) {
    const secretKey = process.env.JWT_SECRET; 
    return jwt.sign(payload, secretKey, { expiresIn: '1d' });
  }
}