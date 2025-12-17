import { Test, TestingModule } from '@nestjs/testing';
import { JwtAuthGuard } from './jwt-auth.guard';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JwtAuthGuard],
    }).compile();

    guard = module.get<JwtAuthGuard>(JwtAuthGuard);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('handleRequest', () => {
    it('should return user when authentication is successful', () => {
      const user = { userId: 1, username: 'testuser', email: 'test@example.com' };
      const result = guard.handleRequest(null, user, null);
      expect(result).toEqual(user);
    });

    it('should throw UnauthorizedException when no user is provided', () => {
      expect(() => guard.handleRequest(null, null, null)).toThrow(
        UnauthorizedException,
      );
    });

    it('should throw error message for expired token', () => {
      const info = { name: 'TokenExpiredError' };
      expect(() => guard.handleRequest(null, null, info)).toThrow(
        'Token has expired',
      );
    });

    it('should throw error message for invalid token signature', () => {
      const info = { name: 'JsonWebTokenError' };
      expect(() => guard.handleRequest(null, null, info)).toThrow(
        'Invalid token signature',
      );
    });

    it('should throw error with info message', () => {
      const info = { message: 'Custom error message' };
      expect(() => guard.handleRequest(null, null, info)).toThrow(
        'Custom error message',
      );
    });

    it('should throw error from err parameter', () => {
      const err = new Error('Authentication error');
      expect(() => guard.handleRequest(err, null, null)).toThrow(
        'Authentication error',
      );
    });
  });
});
