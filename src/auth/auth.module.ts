import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalStrategy } from './local.strategy';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ThrottlerModule } from '@nestjs/throttler';
import { JwtStrategy } from './jwt.strategy';
import { UsersModule } from '../users/users.module';
import { UsersRepository } from '../users/users.repository';
import { AuthController } from './auth.controller';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: `${process.env.JWT_SECRET}`,
      signOptions: { expiresIn: '60m' },
    }),
    ThrottlerModule.forRoot([{
      ttl: 60000, // 1 minute
      limit: 10, // max 10 requests per minute (default)
    }]),
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy, UsersRepository],
  exports: [AuthService],
})
export class AuthModule {}