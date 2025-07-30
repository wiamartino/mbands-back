import { BadRequestException, Injectable, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { RegisterDto, AuthResponseDto, UserResponseDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

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

  async login(user: User): Promise<AuthResponseDto> {
    const payload = { 
      sub: user.userId, 
      username: user.username, 
      email: user.email 
    };
    
    const userResponse: UserResponseDto = {
      id: user.userId.toString(),
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      isActive: user.isActive,
      createdAt: user.createdAt,
    };

    return {
      access_token: this.generateToken(payload),
      user: userResponse,
    };
  }

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const { username, password, email, firstName, lastName } = registerDto;
    
    const existingUser = await this.userService.findOne(username);
    if (existingUser) {
      throw new ConflictException('Username already exists');
    }

    const existingEmail = await this.userService.findByEmail(email);
    if (existingEmail) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser: Partial<User> = { 
      username, 
      password: hashedPassword, 
      email, 
      firstName: firstName || null,
      lastName: lastName || null,
      isActive: true,
    };
    
    const user = await this.userService.create(newUser as User);
    return this.login(user);
  }

  private generateToken(payload: any): string {
    return this.jwtService.sign(payload);
  }
}