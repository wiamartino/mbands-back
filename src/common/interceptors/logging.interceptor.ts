import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Request, Response } from 'express';

export interface RequestLog {
  timestamp: string;
  method: string;
  url: string;
  query?: Record<string, any>;
  body?: Record<string, any>;
  ip?: string;
  userAgent?: string;
}

export interface ResponseLog {
  statusCode: number;
  duration: number;
  message?: string;
  error?: string;
}

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    const startTime = Date.now();
    const requestLog: RequestLog = {
      timestamp: new Date().toISOString(),
      method: request.method,
      url: request.originalUrl || request.url,
      ip: this.getClientIp(request),
      userAgent: request.get('user-agent'),
    };

    // Log query parameters if present
    if (Object.keys(request.query).length > 0) {
      requestLog.query = request.query;
    }

    // Log request body for POST/PUT/PATCH, excluding sensitive fields
    if (this.shouldLogBody(request.method) && request.body) {
      requestLog.body = this.sanitizeBody(request.body);
    }

    this.logger.debug(
      `→ ${requestLog.method} ${requestLog.url}`,
      JSON.stringify(requestLog),
    );

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - startTime;
        const statusCode = response.statusCode;

        const responseLog: ResponseLog = {
          statusCode,
          duration,
        };

        const logMessage = `← ${requestLog.method} ${requestLog.url} ${statusCode} (+${duration}ms)`;

        switch (true) {
          case statusCode >= 500:
            this.logger.error(logMessage, JSON.stringify(responseLog));
            break;
          case statusCode >= 400:
            this.logger.warn(logMessage, JSON.stringify(responseLog));
            break;
          case statusCode >= 300:
            this.logger.log(logMessage);
            break;
          default:
            this.logger.log(logMessage);
        }
      }),
      catchError((error) => {
        const duration = Date.now() - startTime;
        const statusCode = error.status || 500;

        const errorLog = {
          statusCode,
          duration,
          error: error.message,
          message: error.response?.message || error.message,
        };

        this.logger.error(
          `← ${requestLog.method} ${requestLog.url} ${statusCode} (+${duration}ms) [ERROR]`,
          JSON.stringify(errorLog),
        );

        throw error;
      }),
    );
  }

  /**
   * Extract client IP from request headers
   * Handles proxies and load balancers
   */
  private getClientIp(request: Request): string {
    const forwarded = request.headers['x-forwarded-for'];
    if (typeof forwarded === 'string') {
      return forwarded.split(',')[0].trim();
    }
    return (
      request.socket.remoteAddress ||
      request.connection.remoteAddress ||
      'unknown'
    );
  }

  /**
   * Determine if request body should be logged
   */
  private shouldLogBody(method: string): boolean {
    return ['POST', 'PUT', 'PATCH'].includes(method);
  }

  /**
   * Remove sensitive fields from request body
   */
  private sanitizeBody(body: any): Record<string, any> {
    const sensitiveFields = [
      'password',
      'token',
      'secret',
      'apiKey',
      'access_token',
      'refresh_token',
      'creditCard',
      'ssn',
    ];

    const sanitized = { ...body };

    for (const field of sensitiveFields) {
      if (field in sanitized) {
        sanitized[field] = '***REDACTED***';
      }
    }

    return sanitized;
  }
}
