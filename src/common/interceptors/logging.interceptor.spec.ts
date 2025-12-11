import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { LoggingInterceptor } from './logging.interceptor';
import { of, throwError } from 'rxjs';
import { BadRequestException } from '@nestjs/common';

describe('LoggingInterceptor', () => {
  let interceptor: LoggingInterceptor;
  let loggerSpy: jest.SpyInstance;

  beforeEach(() => {
    interceptor = new LoggingInterceptor();
    loggerSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();
    jest.spyOn(Logger.prototype, 'debug').mockImplementation();
    jest.spyOn(Logger.prototype, 'warn').mockImplementation();
    jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  describe('intercept', () => {
    let mockContext: ExecutionContext;
    let mockRequest: any;
    let mockResponse: any;
    let mockCallHandler: CallHandler;

    beforeEach(() => {
      mockRequest = {
        method: 'GET',
        url: '/test',
        originalUrl: '/test',
        query: {},
        body: {},
        headers: {
          'user-agent': 'Jest/Test',
        },
        get: jest.fn((header: string) => {
          if (header === 'user-agent') return 'Jest/Test';
          return undefined;
        }),
        socket: {
          remoteAddress: '127.0.0.1',
        },
        connection: {
          remoteAddress: '127.0.0.1',
        },
      };

      mockResponse = {
        statusCode: 200,
      };

      const mockHttpContext = {
        getRequest: jest.fn().mockReturnValue(mockRequest),
        getResponse: jest.fn().mockReturnValue(mockResponse),
      };

      mockContext = {
        switchToHttp: jest.fn().mockReturnValue(mockHttpContext),
      } as any;

      mockCallHandler = {
        handle: jest.fn().mockReturnValue(of(null)),
      };
    });

    it('should log successful GET request', (done) => {
      const debugSpy = jest.spyOn(Logger.prototype, 'debug');
      const logSpy = jest.spyOn(Logger.prototype, 'log');

      interceptor.intercept(mockContext, mockCallHandler).subscribe(() => {
        expect(debugSpy).toHaveBeenCalled();
        expect(logSpy).toHaveBeenCalled();
        done();
      });
    });

    it('should include request method and URL in log', (done) => {
      const debugSpy = jest.spyOn(Logger.prototype, 'debug');
      mockRequest.method = 'POST';
      mockRequest.url = '/api/users';
      mockRequest.originalUrl = '/api/users';

      interceptor.intercept(mockContext, mockCallHandler).subscribe(() => {
        const call = debugSpy.mock.calls[0];
        expect(call[0]).toContain('POST');
        expect(call[0]).toContain('/api/users');
        done();
      });
    });

    it('should measure response duration', (done) => {
      const logSpy = jest.spyOn(Logger.prototype, 'log');

      interceptor.intercept(mockContext, mockCallHandler).subscribe(() => {
        const call = logSpy.mock.calls[0];
        expect(call[0]).toMatch(/\+\d+ms/);
        done();
      });
    });

    it('should log response status code', (done) => {
      const logSpy = jest.spyOn(Logger.prototype, 'log');
      mockResponse.statusCode = 201;

      interceptor.intercept(mockContext, mockCallHandler).subscribe(() => {
        const call = logSpy.mock.calls[0];
        expect(call[0]).toContain('201');
        done();
      });
    });

    it('should log 4xx responses as warnings', (done) => {
      const warnSpy = jest.spyOn(Logger.prototype, 'warn');
      mockResponse.statusCode = 404;

      interceptor.intercept(mockContext, mockCallHandler).subscribe(() => {
        expect(warnSpy).toHaveBeenCalled();
        done();
      });
    });

    it('should log 5xx responses as errors', (done) => {
      const errorSpy = jest.spyOn(Logger.prototype, 'error');
      mockResponse.statusCode = 500;

      interceptor.intercept(mockContext, mockCallHandler).subscribe(() => {
        expect(errorSpy).toHaveBeenCalled();
        done();
      });
    });

    it('should log query parameters', (done) => {
      const debugSpy = jest.spyOn(Logger.prototype, 'debug');
      mockRequest.query = { page: '1', limit: '10' };

      interceptor.intercept(mockContext, mockCallHandler).subscribe(() => {
        const call = debugSpy.mock.calls[0];
        const logData = JSON.parse(call[1]);
        expect(logData.query).toEqual({ page: '1', limit: '10' });
        done();
      });
    });

    it('should log request body for POST requests', (done) => {
      const debugSpy = jest.spyOn(Logger.prototype, 'debug');
      mockRequest.method = 'POST';
      mockRequest.body = { username: 'john', email: 'john@example.com' };

      interceptor.intercept(mockContext, mockCallHandler).subscribe(() => {
        const call = debugSpy.mock.calls[0];
        const logData = JSON.parse(call[1]);
        expect(logData.body).toEqual({
          username: 'john',
          email: 'john@example.com',
        });
        done();
      });
    });

    it('should redact sensitive fields in request body', (done) => {
      const debugSpy = jest.spyOn(Logger.prototype, 'debug');
      mockRequest.method = 'POST';
      mockRequest.body = {
        username: 'john',
        password: 'secret123',
        email: 'john@example.com',
        token: 'abc123',
      };

      interceptor.intercept(mockContext, mockCallHandler).subscribe(() => {
        const call = debugSpy.mock.calls[0];
        const logData = JSON.parse(call[1]);
        expect(logData.body.password).toBe('***REDACTED***');
        expect(logData.body.token).toBe('***REDACTED***');
        expect(logData.body.username).toBe('john');
        done();
      });
    });

    it('should not log body for GET requests', (done) => {
      const debugSpy = jest.spyOn(Logger.prototype, 'debug');
      mockRequest.method = 'GET';
      mockRequest.body = { someData: 'test' };

      interceptor.intercept(mockContext, mockCallHandler).subscribe(() => {
        const call = debugSpy.mock.calls[0];
        const logData = JSON.parse(call[1]);
        expect(logData.body).toBeUndefined();
        done();
      });
    });

    it('should include client IP in log', (done) => {
      const debugSpy = jest.spyOn(Logger.prototype, 'debug');
      mockRequest.socket.remoteAddress = '192.168.1.100';

      interceptor.intercept(mockContext, mockCallHandler).subscribe(() => {
        const call = debugSpy.mock.calls[0];
        const logData = JSON.parse(call[1]);
        expect(logData.ip).toBe('192.168.1.100');
        done();
      });
    });

    it('should extract IP from x-forwarded-for header', (done) => {
      const debugSpy = jest.spyOn(Logger.prototype, 'debug');
      mockRequest.headers['x-forwarded-for'] = '10.0.0.1, 10.0.0.2';

      interceptor.intercept(mockContext, mockCallHandler).subscribe(() => {
        const call = debugSpy.mock.calls[0];
        const logData = JSON.parse(call[1]);
        expect(logData.ip).toBe('10.0.0.1');
        done();
      });
    });

    it('should include user agent in log', (done) => {
      const debugSpy = jest.spyOn(Logger.prototype, 'debug');
      mockRequest.headers['user-agent'] = 'Mozilla/5.0';
      mockRequest.get = jest.fn((header: string) => {
        if (header === 'user-agent') return 'Mozilla/5.0';
        return undefined;
      });

      interceptor.intercept(mockContext, mockCallHandler).subscribe(() => {
        const call = debugSpy.mock.calls[0];
        const logData = JSON.parse(call[1]);
        expect(logData.userAgent).toBe('Mozilla/5.0');
        done();
      });
    });

    it('should handle request errors gracefully', (done) => {
      const errorSpy = jest.spyOn(Logger.prototype, 'error');
      const error = new BadRequestException('Test error');
      mockCallHandler.handle = jest.fn().mockReturnValue(throwError(() => error));

      interceptor.intercept(mockContext, mockCallHandler).subscribe({
        error: () => {
          expect(errorSpy).toHaveBeenCalled();
          done();
        },
      });
    });

    it('should include error message in error log', (done) => {
      const errorSpy = jest.spyOn(Logger.prototype, 'error');
      const error = new BadRequestException('Validation failed');
      mockCallHandler.handle = jest.fn().mockReturnValue(throwError(() => error));

      interceptor.intercept(mockContext, mockCallHandler).subscribe({
        error: () => {
          const call = errorSpy.mock.calls[0];
          expect(call[0]).toContain('[ERROR]');
          done();
        },
      });
    });

    it('should log PUT requests with body', (done) => {
      const debugSpy = jest.spyOn(Logger.prototype, 'debug');
      mockRequest.method = 'PUT';
      mockRequest.body = { id: 1, name: 'Updated Name' };

      interceptor.intercept(mockContext, mockCallHandler).subscribe(() => {
        const call = debugSpy.mock.calls[0];
        const logData = JSON.parse(call[1]);
        expect(logData.body).toBeDefined();
        done();
      });
    });

    it('should log PATCH requests with body', (done) => {
      const debugSpy = jest.spyOn(Logger.prototype, 'debug');
      mockRequest.method = 'PATCH';
      mockRequest.body = { status: 'active' };

      interceptor.intercept(mockContext, mockCallHandler).subscribe(() => {
        const call = debugSpy.mock.calls[0];
        const logData = JSON.parse(call[1]);
        expect(logData.body).toBeDefined();
        done();
      });
    });
  });
});
