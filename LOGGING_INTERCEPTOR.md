# Logging Interceptor Implementation

## Overview

The **LoggingInterceptor** is a global request/response logger that automatically captures all HTTP traffic flowing through your NestJS application. It provides visibility into request details, response times, and error information without requiring any additional configuration per endpoint.

## Features

✅ **Request Logging** - Captures method, URL, query params, body (with sensitive field redaction)
✅ **Response Logging** - Logs status codes and response time in milliseconds
✅ **Performance Monitoring** - Measures request duration for performance analysis
✅ **Error Tracking** - Logs all errors with context for debugging
✅ **Client Context** - Captures IP address (including proxy detection) and user agent
✅ **Security** - Automatically redacts sensitive fields (passwords, tokens, etc.)
✅ **Audit Trail** - Complete request/response history for compliance and debugging

## How It Works

The interceptor intercepts all HTTP requests and responses in the NestJS application, logs relevant information at each stage, and measures the total execution time.

### Request Logging

When a request comes in, the interceptor logs:

```
→ GET /api/bands?page=1&limit=10
  timestamp: 2025-12-11T23:10:00.000Z
  method: GET
  url: /api/bands?page=1&limit=10
  query: { page: '1', limit: '10' }
  ip: 192.168.1.100
  userAgent: Mozilla/5.0
```

### Response Logging

After the request completes, it logs:

```
← GET /api/bands?page=1&limit=10 200 (+45ms)
```

### Error Logging

When an error occurs:

```
← POST /auth/login 401 (+12ms) [ERROR]
  statusCode: 401
  duration: 12
  message: "Invalid credentials"
```

## Configuration

The interceptor is automatically registered globally in [src/main.ts](src/main.ts):

```typescript
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Register globally
  app.useGlobalInterceptors(new LoggingInterceptor());
  
  // ... rest of bootstrap
}
```

## Log Output Examples

### Successful GET Request

```
[HTTP] → GET /api/bands
[HTTP] ← GET /api/bands 200 (+15ms)
```

### POST with Sensitive Data Redaction

```
[HTTP] → POST /auth/login
  body: { username: 'john', password: '***REDACTED***' }
[HTTP] ← POST /auth/login 200 (+25ms)
```

### Request with Query Parameters

```
[HTTP] → GET /api/bands?genre=Rock&country=USA
  query: { genre: 'Rock', country: 'USA' }
[HTTP] ← GET /api/bands?genre=Rock&country=USA 200 (+30ms)
```

### Error Response

```
[HTTP] → POST /api/bands
  body: { name: 'New Band' }
[HTTP] ← POST /api/bands 400 (+8ms) [ERROR]
  message: "Validation failed"
```

### 5xx Server Error

```
[HTTP] → GET /api/bands/999
[HTTP] ← GET /api/bands/999 500 (+45ms) [ERROR]
  error: "Database connection failed"
```

## Log Levels

The interceptor uses appropriate log levels based on response status:

| Status Code | Log Level | Example |
|---|---|---|
| 500+ | `error` | Server errors, exceptions |
| 400-499 | `warn` | Client errors, validation failures |
| 200-399 | `log` | Success responses |

## Security Features

### Sensitive Field Redaction

The interceptor automatically redacts these fields in request bodies:

- `password`
- `token`
- `secret`
- `apiKey`
- `access_token`
- `refresh_token`
- `creditCard`
- `ssn`

**Example:**

```typescript
// Request body
{
  "username": "john",
  "password": "MySecret123!",
  "email": "john@example.com",
  "apiKey": "abc123xyz"
}

// Logged as
{
  "username": "john",
  "password": "***REDACTED***",
  "email": "john@example.com",
  "apiKey": "***REDACTED***"
}
```

### Client IP Detection

Automatically extracts client IP from various sources:
1. Direct socket connection
2. `x-forwarded-for` header (for proxied requests)
3. Falls back to "unknown" if unavailable

**Example with proxy:**

```
Request headers: x-forwarded-for: 10.0.0.1, 10.0.0.2
Logged IP: 10.0.0.1 (first IP in the chain)
```

## API Reference

### LoggingInterceptor Class

```typescript
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any>
}
```

### Internal Methods

#### `getClientIp(request: Request): string`
Extracts client IP from request, handling proxy headers.

#### `shouldLogBody(method: string): boolean`
Determines if request body should be logged based on HTTP method.
- `POST`, `PUT`, `PATCH` - bodies are logged
- `GET`, `DELETE`, `HEAD`, `OPTIONS` - bodies are not logged

#### `sanitizeBody(body: any): Record<string, any>`
Removes sensitive fields from request body before logging.

## File Locations

```
src/
├── common/
│   └── interceptors/
│       ├── logging.interceptor.ts       # Main interceptor implementation
│       └── logging.interceptor.spec.ts  # Unit tests (18 tests)
└── main.ts                               # Interceptor registered here
```

## Testing

The interceptor includes 18 comprehensive unit tests covering:

```bash
npm run test -- src/common/interceptors/logging.interceptor.spec.ts
```

Test coverage includes:
- ✅ Request logging with method and URL
- ✅ Response duration measurement
- ✅ Status code logging (200s, 400s, 500s)
- ✅ Query parameter logging
- ✅ Request body logging for POST/PUT/PATCH
- ✅ Sensitive field redaction (password, token, etc.)
- ✅ Client IP extraction and proxy detection
- ✅ User agent logging
- ✅ Error handling and error logging
- ✅ No body logging for GET requests

### Test Results

```
Tests:       18 passed, 18 total
Time:        1.5s
Coverage:    All features tested
```

## Performance Considerations

### Impact

The interceptor adds minimal overhead (typically < 1ms per request):

- Captures request start time: `Date.now()` - negligible cost
- Sanitizes body on demand: only for POST/PUT/PATCH
- Uses RxJS operators (tap, catchError): highly optimized

### Optimization Tips

1. **Custom Redaction** - Add more fields to redact if needed:
   ```typescript
   private sensitiveFields = [
     'password', 'token', 'secret', 'ssn',
     'customField' // Add your custom sensitive fields
   ];
   ```

2. **Disable for Specific Routes** - Create route-specific logic if needed:
   ```typescript
   // Check request URL and skip logging for high-traffic routes
   if (request.url.startsWith('/metrics')) return next.handle();
   ```

## Integration with Monitoring

The interceptor provides structured logs perfect for integration with:

- **ELK Stack** - Elasticsearch, Logstash, Kibana
- **Splunk** - Log aggregation and analysis
- **DataDog** - Application monitoring
- **New Relic** - Performance monitoring
- **Sentry** - Error tracking

**Example: Parse logs in Elasticsearch**

```json
{
  "timestamp": "2025-12-11T23:10:00.000Z",
  "method": "POST",
  "url": "/auth/login",
  "statusCode": 401,
  "duration": 25,
  "ip": "192.168.1.100",
  "userAgent": "Mozilla/5.0"
}
```

## Best Practices

1. ✅ Use with global exception filter for consistent error handling
2. ✅ Pair with structured logging (Winston, Pino) for file persistence
3. ✅ Monitor high-latency requests (> 1000ms)
4. ✅ Set up alerts for error spikes (4xx/5xx rates)
5. ✅ Use logs for performance analysis and bottleneck identification
6. ✅ Keep sensitive field redaction list updated
7. ✅ Review logs regularly for security anomalies (unusual IPs, patterns)

## Future Enhancements

- [ ] Add request ID/correlation tracking for distributed tracing
- [ ] Implement per-route logging configuration
- [ ] Add response body logging (with size limits)
- [ ] Integrate with OpenTelemetry for distributed tracing
- [ ] Add metrics export for Prometheus
- [ ] Support custom log formatters
- [ ] Add request filtering/sampling for high-traffic APIs
- [ ] Track and log database query counts per request

## Troubleshooting

### Missing IP Address

**Problem:** IP shows as "unknown"

**Solution:** Check if application is behind a proxy and ensure `x-forwarded-for` headers are properly set.

### Too Much Logging

**Problem:** Log volume is too high

**Solution:** Consider adding log sampling or disabling for specific high-traffic routes.

### Sensitive Data Still Visible

**Problem:** Custom sensitive fields not redacted

**Solution:** Add fields to the `sensitiveFields` array in the interceptor.

## Security Considerations

⚠️ **Important:** Even with redaction, be cautious with:
- Logs containing URLs with sensitive query parameters (API keys in URL)
- User IDs that could be used for enumeration attacks
- Stack traces that reveal system details

**Recommendation:** Always encrypt logs at rest and in transit when storing sensitive application information.
