# Global Exception Filter Implementation

## Overview

The **HttpExceptionFilter** is a global exception handler that intercepts all `HttpException` thrown in your NestJS application and provides consistent, secure error responses.

## Features

✅ **Standardized Error Format** - All errors follow the same structure
✅ **Environment-Aware** - Hides sensitive details in production
✅ **Structured Logging** - Logs all exceptions with appropriate levels
✅ **Request Context** - Includes method, path, and timestamp for debugging
✅ **Security-Focused** - No stack traces or internal details exposed to clients in production

## Error Response Format

### Success Response Format

```json
{
  "statusCode": 400,
  "timestamp": "2025-12-11T23:05:00.000Z",
  "path": "/auth/login",
  "method": "POST",
  "message": "Validation failed" // String or array of strings
}
```

### Development Response Format (includes error type)

```json
{
  "statusCode": 400,
  "timestamp": "2025-12-11T23:05:00.000Z",
  "path": "/auth/login",
  "method": "POST",
  "message": ["Password must be at least 8 characters"],
  "error": "BadRequest"
}
```

### Production Response Format (sensitive info hidden)

```json
{
  "statusCode": 400,
  "timestamp": "2025-12-11T23:05:00.000Z",
  "path": "/auth/login",
  "method": "POST",
  "message": ["Password must be at least 8 characters"]
}
```

## Usage

The filter is **automatically applied globally** to all HTTP exceptions. No special configuration needed.

### Example: How Exceptions Are Handled

```typescript
// In your service or controller
@Post('login')
async login(@Body() loginDto: LoginDto) {
  // This BadRequestException...
  throw new BadRequestException('Invalid credentials');
  
  // ...is caught by the filter and returns:
  // {
  //   statusCode: 400,
  //   timestamp: "2025-12-11T23:05:00.000Z",
  //   path: "/login",
  //   method: "POST",
  //   message: "Invalid credentials"
  // }
}
```

## Logging Levels

The filter automatically assigns appropriate log levels:

| Status Code Range | Log Level | Use Case |
|---|---|---|
| 500+ | `error` | Server errors, stack traces included |
| 400-499 | `warn` | Client errors, validation failures |
| 200-399 | `log` | Informational (rare for exceptions) |

### Example Logs

```
[NestFactory] HttpExceptionFilter - error POST /auth/login - 500: "Database connection failed"
[NestFactory] HttpExceptionFilter - warn POST /auth/login - 401: "Invalid credentials"
```

## Security Benefits

1. **No Stack Traces in Production** - Prevents information disclosure
2. **Consistent Error Format** - Harder to exploit API via error messages
3. **Timestamp Validation** - Helps detect replay attacks
4. **Request Context** - Better audit trail

## Testing

The filter includes comprehensive unit tests:

```bash
npm run test -- src/common/filters/http-exception.filter.spec.ts
```

Tests cover:
- ✅ Error message extraction
- ✅ Status code handling
- ✅ Environment-specific responses (dev vs prod)
- ✅ Array of messages handling
- ✅ Timestamp inclusion
- ✅ Logging behavior

## Integration with Other Exceptions

This filter only catches `HttpException` and its subclasses:

- ✅ `BadRequestException`
- ✅ `UnauthorizedException`
- ✅ `ForbiddenException`
- ✅ `NotFoundException`
- ✅ `ConflictException`
- ✅ Custom exceptions extending `HttpException`

### For Other Exception Types

For runtime errors and non-HTTP exceptions, NestJS provides the `AllExceptionsFilter` base class. To handle all exceptions:

```typescript
import { Catch, ArgumentsHost, HttpStatus } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';

@Catch()
export class AllExceptionsFilter extends BaseExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    // Handle ALL exceptions including non-HTTP ones
    super.catch(exception, host);
  }
}
```

## File Locations

```
src/
├── common/
│   └── filters/
│       ├── http-exception.filter.ts       # Main filter implementation
│       └── http-exception.filter.spec.ts  # Unit tests
└── main.ts                                 # Filter registered here
```

## Configuration in main.ts

```typescript
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Register the global filter
  app.useGlobalFilters(new HttpExceptionFilter());
  
  // ... rest of bootstrap
}
```

## Best Practices

1. ✅ Always throw `HttpException` subclasses in controllers/services
2. ✅ Provide meaningful error messages (helps with debugging)
3. ✅ Use appropriate status codes (400 for validation, 401 for auth, 404 for not found)
4. ✅ Log sensitive operations separately from HTTP responses
5. ✅ Include request IDs in logs for correlation (future enhancement)

## Future Enhancements

- Add request ID tracking for better correlation
- Implement rate limiting per error type
- Add metrics/monitoring integration
- Support custom error codes
- Implement error tracking (Sentry/DataDog integration)
