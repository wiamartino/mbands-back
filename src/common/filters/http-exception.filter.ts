import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

export interface ErrorResponse {
  statusCode: number;
  timestamp: string;
  path: string;
  method: string;
  message: string | string[];
  error?: string;
}

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('HttpExceptionFilter');

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    // Extract error details
    const errorResponse: ErrorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message:
        (exceptionResponse as any)?.message ||
        exception.message ||
        'Internal Server Error',
    };

    // Include error type in development only
    if (process.env.NODE_ENV !== 'production') {
      errorResponse.error = (exceptionResponse as any)?.error || undefined;
    }

    // Log error details
    const logMessage = `${request.method} ${request.url} - ${status}: ${JSON.stringify(errorResponse.message)}`;

    switch (true) {
      case status >= 500:
        this.logger.error(logMessage, exception.stack);
        break;
      case status >= 400:
        this.logger.warn(logMessage);
        break;
      default:
        this.logger.log(logMessage);
    }

    response.status(status).json(errorResponse);
  }
}
