import { Controller, Get, Param } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from '../users/entities/user.entity';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':username')
  async findOne(@Param('username') username: string): Promise<User | undefined> {
    return this.usersService.findOne(username);
  }
}