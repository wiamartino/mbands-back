import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus, BadRequestException } from '@nestjs/common';
import { HttpExceptionFilter } from './http-exception.filter';

describe('HttpExceptionFilter', () => {
  let filter: HttpExceptionFilter;

  beforeEach(() => {
    filter = new HttpExceptionFilter();
  });

  it('should be defined', () => {
    expect(filter).toBeDefined();
  });

  describe('catch', () => {
    let mockResponse;
    let mockRequest;
    let mockHost;

    beforeEach(() => {
      mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      mockRequest = {
        url: '/test',
        method: 'POST',
      };

      mockHost = {
        switchToHttp: jest.fn().mockReturnValue({
          getResponse: jest.fn().mockReturnValue(mockResponse),
          getRequest: jest.fn().mockReturnValue(mockRequest),
        }),
      };
    });

    it('should handle BadRequestException correctly', () => {
      const exception = new BadRequestException('Validation failed');

      filter.catch(exception, mockHost as any);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: HttpStatus.BAD_REQUEST,
          path: '/test',
          method: 'POST',
          message: 'Validation failed',
        }),
      );
    });

    it('should include timestamp in response', () => {
      const exception = new BadRequestException('Test error');
      const beforeCall = new Date();

      filter.catch(exception, mockHost as any);

      const callArg = mockResponse.json.mock.calls[0][0];
      const timestamp = new Date(callArg.timestamp);

      expect(timestamp.getTime()).toBeGreaterThanOrEqual(beforeCall.getTime());
    });

    it('should not include error field in production', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const exception = new BadRequestException({
        message: 'Validation failed',
        error: 'BadRequest',
      });

      filter.catch(exception, mockHost as any);

      const callArg = mockResponse.json.mock.calls[0][0];
      expect(callArg.error).toBeUndefined();

      process.env.NODE_ENV = originalEnv;
    });

    it('should include error field in development', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const exception = new BadRequestException({
        message: 'Validation failed',
        error: 'BadRequest',
      });

      filter.catch(exception, mockHost as any);

      const callArg = mockResponse.json.mock.calls[0][0];
      expect(callArg.error).toBeDefined();

      process.env.NODE_ENV = originalEnv;
    });

    it('should handle array of messages', () => {
      const messages = ['Field is required', 'Field must be a number'];
      const exception = new BadRequestException(messages);

      filter.catch(exception, mockHost as any);

      const callArg = mockResponse.json.mock.calls[0][0];
      expect(Array.isArray(callArg.message)).toBe(true);
      expect(callArg.message).toEqual(messages);
    });

    it('should handle 500 status with error logging', () => {
      const exception = new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );

      filter.catch(exception, mockHost as any);

      expect(mockResponse.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    });
  });
});
