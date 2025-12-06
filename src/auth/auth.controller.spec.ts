import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto';
import {
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockUser = {
    userId: 1,
    username: 'testuser',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    isActive: true,
    createdAt: new Date(),
    password: 'hashedPassword',
    roles: [],
    lastLoginAt: null,
    updatedAt: new Date(),
    deletedAt: null,
  };

  const mockAuthResponse = {
    access_token: 'jwt-token',
    user: {
      id: '1',
      username: 'testuser',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      isActive: true,
      createdAt: new Date(),
    },
  };

  const mockAuthService = {
    validateUser: jest.fn(),
    login: jest.fn(),
    register: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      username: 'testuser',
      password: 'password123',
    };

    it('should login successfully with valid credentials', async () => {
      mockAuthService.validateUser.mockResolvedValue(mockUser);
      mockAuthService.login.mockResolvedValue(mockAuthResponse);

      const result = await controller.login(loginDto);

      expect(authService.validateUser).toHaveBeenCalledWith(
        loginDto.username,
        loginDto.password,
      );
      expect(authService.login).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(mockAuthResponse);
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      mockAuthService.validateUser.mockResolvedValue(null);

      await expect(controller.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(authService.validateUser).toHaveBeenCalledWith(
        loginDto.username,
        loginDto.password,
      );
      expect(authService.login).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException for service errors', async () => {
      mockAuthService.validateUser.mockRejectedValue(
        new Error('Service error'),
      );

      await expect(controller.login(loginDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should preserve UnauthorizedException from service', async () => {
      const unauthorizedException = new UnauthorizedException('Custom message');
      mockAuthService.validateUser.mockRejectedValue(unauthorizedException);

      await expect(controller.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('register', () => {
    const registerDto: RegisterDto = {
      username: 'newuser',
      password: 'NewSecurePass123!',
      email: 'newuser@example.com',
      firstName: 'New',
      lastName: 'User',
    };

    it('should register successfully with valid data', async () => {
      mockAuthService.register.mockResolvedValue(mockAuthResponse);

      const result = await controller.register(registerDto);

      expect(authService.register).toHaveBeenCalledWith(registerDto);
      expect(result).toEqual(mockAuthResponse);
    });

    it('should throw ConflictException for duplicate username/email', async () => {
      const duplicateError = { code: '23505' };
      mockAuthService.register.mockRejectedValue(duplicateError);

      await expect(controller.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should preserve ConflictException from service', async () => {
      const conflictException = new ConflictException('Custom conflict');
      mockAuthService.register.mockRejectedValue(conflictException);

      await expect(controller.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw BadRequestException for other service errors', async () => {
      mockAuthService.register.mockRejectedValue(new Error('Service error'));

      await expect(controller.register(registerDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
