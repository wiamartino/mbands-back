import {
  BadRequestException,
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { RegisterDto, AuthResponseDto, UserResponseDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async validateUser(username: string, password: string) {
    const user = await this.userService.findOne(username);
    if (!user) {
      return null;
    }

    // Only use bcrypt to compare passwords - never accept plaintext
    const isMatch: boolean = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      throw new BadRequestException('Password does not match');
    }
    return user;
  }

  async login(user: User): Promise<AuthResponseDto> {
    return this.buildAuthResponse(user);
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
    return this.buildAuthResponse(user);
  }

  async refreshTokens(refreshToken: string): Promise<AuthResponseDto> {
    const refreshPayload = this.verifyRefreshToken(refreshToken);
    const user = await this.userService.findById(refreshPayload.sub);

    if (!user?.refreshTokenHash) {
      throw new UnauthorizedException('Refresh token is not valid');
    }

    const isMatch = await bcrypt.compare(refreshToken, user.refreshTokenHash);
    if (!isMatch) {
      throw new UnauthorizedException('Refresh token is not valid');
    }

    if (
      user.refreshTokenExpiresAt &&
      user.refreshTokenExpiresAt.getTime() < Date.now()
    ) {
      throw new UnauthorizedException('Refresh token expired');
    }

    return this.buildAuthResponse(user);
  }

  private verifyRefreshToken(token: string) {
    const refreshSecret =
      this.configService.get<string>('JWT_REFRESH_SECRET') ||
      this.configService.get<string>('JWT_SECRET');

    try {
      return this.jwtService.verify(token, { secret: refreshSecret });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private async buildAuthResponse(user: User): Promise<AuthResponseDto> {
    const payload = {
      sub: user.userId,
      username: user.username,
      email: user.email,
    };

    const { accessToken, refreshToken, refreshExpiresAt } =
      this.generateTokens(payload);

    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    await this.userService.updateRefreshToken(
      user.userId,
      refreshTokenHash,
      refreshExpiresAt,
    );
    await this.userService.updateLastLogin(user.userId);

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
      access_token: accessToken,
      refresh_token: refreshToken,
      user: userResponse,
    };
  }

  private generateTokens(payload: any): {
    accessToken: string;
    refreshToken: string;
    refreshExpiresAt: Date | null;
  } {
    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: (this.configService.get<string>('JWT_ACCESS_EXPIRES_IN') ||
        '15m') as any,
    });

    const refreshSecret =
      this.configService.get<string>('JWT_REFRESH_SECRET') ||
      this.configService.get<string>('JWT_SECRET');
    const refreshExpiresIn =
      this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') || '7d';

    const refreshToken = this.jwtService.sign(payload, {
      secret: refreshSecret,
      expiresIn: refreshExpiresIn as any,
    });

    const decoded = this.jwtService.decode(refreshToken) as { exp?: number };
    const refreshExpiresAt = decoded?.exp ? new Date(decoded.exp * 1000) : null;

    return { accessToken, refreshToken, refreshExpiresAt };
  }
}
