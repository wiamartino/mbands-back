## About

API for Bands


## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# e2e tests with DB (docker compose)
$ npm run test:e2e:db

# test coverage
$ npm run test:cov
```

## Improvements Summary
- Security: helmet, CORS, global validation pipe, exception filter.
- Performance: compression, graceful shutdown, optimized database connection pooling.
- Stability: Global API prefix `v1`, Swagger disabled in production.
- Rate limiting: ThrottlerModule + global ThrottlerGuard.
- Observability: `/v1/health` endpoint (DB ping via Terminus).
- Logging: Structured JSON logs via `nestjs-pino`.
- Testing: Coverage thresholds, e2e health test and DB setup.
- DB Config: Unified TypeOrmModule and migration DataSource using `DATABASE_URL`.
- Repository Pattern: Consistent custom repositories across all modules with optimized queries.

## Database Configuration
- **Connection Pooling:** Production-optimized pool settings with environment-specific configurations
- **SSL Support:** Optional SSL/TLS encryption for production databases
- **Query Monitoring:** Automatic logging of slow queries and connection issues
- **Auto-Retry:** Configurable reconnection attempts with exponential backoff
- See [DATABASE_POOL_CONFIG.md](DATABASE_POOL_CONFIG.md) for detailed configuration guide

## Environment Variables
Required (validated at startup):
- NODE_ENV (`development` | `test` | `production`)
- PORT (default `3000`)
- FRONTEND_URL
- JWT_SECRET (min length 16)
- DATABASE_URL (Postgres connection string)

Optional database pool configuration:
- DB_POOL_MAX (default: 10 dev, 30 prod)
- DB_POOL_MIN (default: 2 dev, 5 prod)
- DB_POOL_IDLE (default: 10000ms dev, 30000ms prod)
- DB_POOL_TIMEOUT (default: 10000ms)
- DB_STATEMENT_TIMEOUT (default: 30000ms)
- DB_RETRY_ATTEMPTS (default: 10)
- DB_SSL (default: false, set `true` for production)

See [.env.example](.env.example) for all available options.

## Health Check
- Endpoint: `GET /v1/health`
- Response: `{ status: 'ok', details: { database: { status: 'up' } } }`

## Swagger
- Available at `/api` in non-production environments.

## Rate Limiting
- Global limit: 100 requests per 60 seconds per IP.
- Override per-route with `@Throttle()` if needed.
