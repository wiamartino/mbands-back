import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { LoggingInterceptor } from '../src/common/interceptors/logging.interceptor';
import { BadRequestException } from '@nestjs/common';
import { of } from 'rxjs';

describe('Component Performance Tests', () => {
  describe('HttpExceptionFilter Performance', () => {
    let filter: HttpExceptionFilter;

    beforeEach(() => {
      filter = new HttpExceptionFilter();
    });

    it('should process exception with minimal overhead', () => {
      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      const mockRequest = {
        url: '/test',
        method: 'POST',
      };

      const mockHost = {
        switchToHttp: jest.fn().mockReturnValue({
          getResponse: jest.fn().mockReturnValue(mockResponse),
          getRequest: jest.fn().mockReturnValue(mockRequest),
        }),
      };

      const exception = new BadRequestException('Test error');

      const startTime = performance.now();

      for (let i = 0; i < 1000; i++) {
        filter.catch(exception, mockHost as any);
      }

      const duration = performance.now() - startTime;
      const avgTime = duration / 1000;

      console.log(
        `\n  Exception Filter: ${avgTime.toFixed(4)}ms per call (1000 iterations)`,
      );

      // Should process very quickly - less than 0.1ms per call
      expect(avgTime).toBeLessThan(0.1);
    });

    it('should handle large error responses efficiently', () => {
      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      const mockRequest = {
        url: '/test',
        method: 'POST',
      };

      const mockHost = {
        switchToHttp: jest.fn().mockReturnValue({
          getResponse: jest.fn().mockReturnValue(mockResponse),
          getRequest: jest.fn().mockReturnValue(mockRequest),
        }),
      };

      // Create error with large message
      const largeMessage = 'Error: ' + 'x'.repeat(10000);
      const exception = new BadRequestException(largeMessage);

      const startTime = performance.now();

      for (let i = 0; i < 100; i++) {
        filter.catch(exception, mockHost as any);
      }

      const duration = performance.now() - startTime;
      const avgTime = duration / 100;

      console.log(
        `\n  Exception Filter (large payload): ${avgTime.toFixed(4)}ms per call`,
      );

      // Should still handle efficiently even with large payloads
      expect(avgTime).toBeLessThan(2.5);
    });

    it('should compare performance of multiple exception types', () => {
      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      const mockRequest = {
        url: '/test',
        method: 'POST',
      };

      const mockHost = {
        switchToHttp: jest.fn().mockReturnValue({
          getResponse: jest.fn().mockReturnValue(mockResponse),
          getRequest: jest.fn().mockReturnValue(mockRequest),
        }),
      };

      const exceptions = [
        new BadRequestException('Bad request'),
        new BadRequestException(['Error 1', 'Error 2', 'Error 3']),
        new BadRequestException({ message: 'Complex error' }),
      ];

      const results = [];

      for (const exception of exceptions) {
        const startTime = performance.now();

        for (let i = 0; i < 500; i++) {
          filter.catch(exception, mockHost as any);
        }

        const duration = performance.now() - startTime;
        results.push({
          type: exception.constructor.name,
          message: String(exception.getResponse()).substring(0, 50),
          avgTime: duration / 500,
        });
      }

      console.log(`\n  Exception Filter Comparison:`);
      results.forEach(({ type, message, avgTime }) => {
        console.log(`    ${type}: ${avgTime.toFixed(4)}ms`);
      });

      results.forEach(({ avgTime }) => {
        expect(avgTime).toBeLessThan(0.1);
      });
    });
  });

  describe('LoggingInterceptor Performance', () => {
    let interceptor: LoggingInterceptor;

    beforeEach(() => {
      interceptor = new LoggingInterceptor();
    });

    it('should process request with minimal overhead', (done) => {
      const mockRequest = {
        method: 'GET',
        originalUrl: '/api/test',
        query: {},
        body: {},
        headers: { 'user-agent': 'test' },
        get: jest.fn(),
        socket: { remoteAddress: '127.0.0.1' },
        connection: { remoteAddress: '127.0.0.1' },
      };

      const mockResponse = { statusCode: 200 };

      const mockContext = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue(mockRequest),
          getResponse: jest.fn().mockReturnValue(mockResponse),
        }),
      };

      const mockCallHandler = {
        handle: jest.fn().mockReturnValue(of(null)),
      };

      const startTime = performance.now();
      let completedCount = 0;

      for (let i = 0; i < 100; i++) {
        interceptor
          .intercept(mockContext as any, mockCallHandler as any)
          .subscribe(() => {
            completedCount++;

            if (completedCount === 100) {
              const duration = performance.now() - startTime;
              const avgTime = duration / 100;

              console.log(
                `\n  Logging Interceptor: ${avgTime.toFixed(4)}ms per call (100 iterations)`,
              );

              expect(avgTime).toBeLessThan(2);
              done();
            }
          });
      }
    }, 90000);

    it('should handle large request bodies efficiently', (done) => {
      const largeBody = {
        data: 'x'.repeat(50000),
        nested: {
          field1: 'value1'.repeat(1000),
          field2: 'value2'.repeat(1000),
        },
      };

      const mockRequest = {
        method: 'POST',
        originalUrl: '/api/test',
        query: {},
        body: largeBody,
        headers: { 'user-agent': 'test' },
        get: jest.fn(),
        socket: { remoteAddress: '127.0.0.1' },
        connection: { remoteAddress: '127.0.0.1' },
      };

      const mockResponse = { statusCode: 200 };

      const mockContext = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue(mockRequest),
          getResponse: jest.fn().mockReturnValue(mockResponse),
        }),
      };

      const mockCallHandler = {
        handle: jest.fn().mockReturnValue(of(null)),
      };

      const startTime = performance.now();
      let completedCount = 0;

      for (let i = 0; i < 30; i++) {
        interceptor
          .intercept(mockContext as any, mockCallHandler as any)
          .subscribe(() => {
            completedCount++;

            if (completedCount === 30) {
              const duration = performance.now() - startTime;
              const avgTime = duration / 30;

              console.log(
                `\n  Logging Interceptor (large body): ${avgTime.toFixed(4)}ms per call`,
              );

              expect(avgTime).toBeLessThan(12);
              done();
            }
          });
      }
    }, 150000);

    it('should efficiently redact sensitive fields', (done) => {
      const sensitiveBody = {
        username: 'john',
        password: 'MyPassword123!',
        email: 'john@example.com',
        apiKey: 'secret-api-key-12345',
        creditCard: '4111-1111-1111-1111',
        token: 'bearer-token-xyz',
        ssn: '123-45-6789',
      };

      const mockRequest = {
        method: 'POST',
        originalUrl: '/auth/login',
        query: {},
        body: sensitiveBody,
        headers: { 'user-agent': 'test' },
        get: jest.fn(),
        socket: { remoteAddress: '127.0.0.1' },
        connection: { remoteAddress: '127.0.0.1' },
      };

      const mockResponse = { statusCode: 200 };

      const mockContext = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue(mockRequest),
          getResponse: jest.fn().mockReturnValue(mockResponse),
        }),
      };

      const mockCallHandler = {
        handle: jest.fn().mockReturnValue(of(null)),
      };

      const startTime = performance.now();
      let completedCount = 0;

      for (let i = 0; i < 200; i++) {
        interceptor
          .intercept(mockContext as any, mockCallHandler as any)
          .subscribe(() => {
            completedCount++;
            if (completedCount === 200) {
              const duration = performance.now() - startTime;
              const avgTime = duration / 200;

              console.log(
                `\n  Logging Interceptor (redaction): ${avgTime.toFixed(4)}ms per call (200 iterations)`,
              );

              expect(avgTime).toBeLessThan(1);
              done();
            }
          });
      }
    });
  });

  describe('Comparative Performance Analysis', () => {
    it('should compare filter vs interceptor overhead', (done) => {
      const filter = new HttpExceptionFilter();
      const interceptor = new LoggingInterceptor();

      // Test filter
      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      const mockRequest = {
        url: '/test',
        method: 'POST',
      };

      const mockHost = {
        switchToHttp: jest.fn().mockReturnValue({
          getResponse: jest.fn().mockReturnValue(mockResponse),
          getRequest: jest.fn().mockReturnValue(mockRequest),
        }),
      };

      const exception = new BadRequestException('Test');

      const filterStart = performance.now();
      for (let i = 0; i < 500; i++) {
        filter.catch(exception, mockHost as any);
      }
      const filterDuration = (performance.now() - filterStart) / 500;

      // Test interceptor
      const mockReqForInterceptor = {
        method: 'GET',
        originalUrl: '/api/test',
        query: {},
        body: {},
        headers: { 'user-agent': 'test' },
        get: jest.fn(),
        socket: { remoteAddress: '127.0.0.1' },
        connection: { remoteAddress: '127.0.0.1' },
      };

      const mockRespForInterceptor = { statusCode: 200 };

      const mockCtxForInterceptor = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue(mockReqForInterceptor),
          getResponse: jest.fn().mockReturnValue(mockRespForInterceptor),
        }),
      };

      const mockHandlerForInterceptor = {
        handle: jest.fn().mockReturnValue(of(null)),
      };

      const interceptorStart = performance.now();
      let completedCount = 0;

      for (let i = 0; i < 500; i++) {
        interceptor
          .intercept(
            mockCtxForInterceptor as any,
            mockHandlerForInterceptor as any,
          )
          .subscribe(() => {
            completedCount++;

            if (completedCount === 500) {
              const interceptorDuration =
                (performance.now() - interceptorStart) / 500;

              console.log(`\n  Performance Comparison:
    Filter: ${filterDuration.toFixed(4)}ms
    Interceptor: ${interceptorDuration.toFixed(4)}ms
    Difference: ${Math.abs(interceptorDuration - filterDuration).toFixed(4)}ms`);

              expect(filterDuration).toBeLessThan(0.1);
              expect(interceptorDuration).toBeLessThan(0.5);
              done();
            }
          });
      }
    });
  });
});
