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
- Performance: compression, graceful shutdown.
- Stability: Global API prefix `v1`, Swagger disabled in production.
- Rate limiting: ThrottlerModule + global ThrottlerGuard.
- Observability: `/v1/health` endpoint (DB ping via Terminus).
- Logging: Structured JSON logs via `nestjs-pino`.
- Testing: Coverage thresholds, e2e health test and DB setup.
- DB Config: Unified TypeOrmModule and migration DataSource using `DATABASE_URL`.

## Environment Variables
Required (validated at startup):
- NODE_ENV (`development` | `test` | `production`)
- PORT (default `3000`)
- FRONTEND_URL
- JWT_SECRET (min length 16)
- DATABASE_URL (Postgres connection string)

Optional for local/docker:
- DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_NAME

Test env example: see [.env.test](.env.test).

## Health Check
- Endpoint: `GET /v1/health`
- Response: `{ status: 'ok', details: { database: { status: 'up' } } }`

## Swagger
- Available at `/api` in non-production environments.

## Rate Limiting
- Global limit: 100 requests per 60 seconds per IP.
- Override per-route with `@Throttle()` if needed.
