# Database Connection Pool Configuration

## Overview

This application uses PostgreSQL with optimized connection pooling via TypeORM and node-postgres (pg) for efficient database resource management.

## Configuration Parameters

### Core Pool Settings

#### `DB_POOL_MAX` (Maximum Pool Size)
- **Default:** 10 (development), 30 (production)
- **Description:** Maximum number of database connections in the pool
- **Recommendations:**
  - **Development:** 10 connections
  - **Small Production (1-2 servers):** 20-30 connections
  - **Medium Production (3-5 servers):** 15-25 connections per server
  - **Large Production (5+ servers):** 10-20 connections per server

**Formula:** `(Server Count × Pool Size) < (PostgreSQL max_connections - reserved)`

Example: If PostgreSQL `max_connections = 100`, reserve 10 for maintenance, allow 90 for the app.
- 3 servers × 30 connections = 90 connections total ✅

#### `DB_POOL_MIN` (Minimum Pool Size)
- **Default:** 2 (development), 5 (production)
- **Description:** Minimum number of idle connections maintained
- **Benefits:** Reduces latency by keeping connections warm
- **Recommendations:**
  - Development: 2
  - Production: 5-10 (depending on traffic patterns)

#### `DB_POOL_IDLE` (Idle Timeout)
- **Default:** 10000ms (development), 30000ms (production)
- **Description:** Time before an idle connection is closed
- **Recommendations:**
  - High traffic: 30000ms (30s)
  - Medium traffic: 20000ms (20s)
  - Low traffic: 10000ms (10s)

#### `DB_POOL_TIMEOUT` (Connection Timeout)
- **Default:** 10000ms (10s)
- **Description:** Maximum time to wait for a connection from the pool
- **Recommendations:**
  - Production: 10000ms (10s)
  - Development: 5000ms (5s)
- **Note:** If connections are frequently timing out, increase `DB_POOL_MAX`

### Advanced Settings

#### `DB_POOL_MAX_USES` (Connection Recycling)
- **Default:** 7500
- **Description:** Number of times a connection can be reused before being recycled
- **Purpose:** Prevents memory leaks from long-lived connections
- **Recommendation:** 5000-10000 for production

#### `DB_STATEMENT_TIMEOUT` (Query Timeout)
- **Default:** 30000ms (30s)
- **Description:** Maximum time a single query can run
- **Recommendations:**
  - OLTP (transactional): 5000-15000ms
  - Reports/Analytics: 60000-300000ms
  - Background jobs: 300000ms+

#### `DB_APP_NAME` (Application Identifier)
- **Default:** 'mbands-api'
- **Description:** Application name visible in PostgreSQL logs
- **Usage:** Helps identify connections in `pg_stat_activity`
- **Example:** `SELECT * FROM pg_stat_activity WHERE application_name = 'mbands-api';`

### Retry Configuration

#### `DB_RETRY_ATTEMPTS`
- **Default:** 10
- **Description:** Number of reconnection attempts
- **Recommendations:**
  - Production: 10-15
  - Development: 3-5

#### `DB_RETRY_DELAY`
- **Default:** 3000ms
- **Description:** Delay between reconnection attempts
- **Recommendations:**
  - Production: 3000-5000ms
  - Development: 1000-2000ms

### Monitoring

#### `DB_MAX_QUERY_TIME`
- **Default:** 5000ms (production), 10000ms (development)
- **Description:** Log warnings for slow queries exceeding this time
- **Purpose:** Performance monitoring and optimization

### SSL Configuration (Production)

#### `DB_SSL`
- **Default:** false
- **Description:** Enable SSL/TLS for database connections
- **Production:** Set to `true` for encrypted connections

#### `DB_SSL_REJECT_UNAUTHORIZED`
- **Default:** true
- **Description:** Verify server certificate
- **Production:** Keep `true` for security

#### Certificate Paths
- `DB_SSL_CA`: Path to CA certificate
- `DB_SSL_KEY`: Path to client key
- `DB_SSL_CERT`: Path to client certificate

## Environment-Specific Configurations

### Development
```env
DB_POOL_MAX=10
DB_POOL_MIN=2
DB_POOL_IDLE=10000
DB_POOL_TIMEOUT=5000
DB_SSL=false
```

### Staging
```env
DB_POOL_MAX=20
DB_POOL_MIN=5
DB_POOL_IDLE=20000
DB_POOL_TIMEOUT=10000
DB_SSL=true
```

### Production (Single Server)
```env
DB_POOL_MAX=30
DB_POOL_MIN=10
DB_POOL_IDLE=30000
DB_POOL_TIMEOUT=10000
DB_STATEMENT_TIMEOUT=30000
DB_MAX_QUERY_TIME=5000
DB_SSL=true
DB_SSL_REJECT_UNAUTHORIZED=true
```

### Production (Multi-Server)
```env
# For 3 servers with PostgreSQL max_connections=100
DB_POOL_MAX=25
DB_POOL_MIN=8
DB_POOL_IDLE=30000
DB_POOL_TIMEOUT=10000
```

## Tuning Guidelines

### 1. Calculate Optimal Pool Size

**Formula:**
```
connections = (core_count × 2) + effective_spindle_count
```

For a 4-core server with SSD:
```
connections = (4 × 2) + 1 = 9
```

**Recommendation:** Start with 10-15 connections per server, then tune based on monitoring.

### 2. Monitor Pool Usage

Check active connections:
```sql
SELECT 
  application_name,
  COUNT(*) as connections,
  state
FROM pg_stat_activity
WHERE application_name = 'mbands-api'
GROUP BY application_name, state;
```

### 3. Identify Connection Leaks

Check for long-running connections:
```sql
SELECT 
  pid,
  application_name,
  state,
  query,
  state_change,
  NOW() - state_change AS duration
FROM pg_stat_activity
WHERE application_name = 'mbands-api'
  AND state_change < NOW() - INTERVAL '5 minutes';
```

### 4. Monitor Slow Queries

The app logs queries exceeding `DB_MAX_QUERY_TIME`. Review these logs:
```bash
grep "Query took" logs/app.log
```

## Troubleshooting

### Problem: "Connection timeout" errors

**Causes:**
- Pool exhausted (all connections busy)
- Slow queries blocking connections
- Connection leaks

**Solutions:**
1. Increase `DB_POOL_MAX`
2. Optimize slow queries
3. Check for connection leaks
4. Add indexes to frequently queried tables

### Problem: "Too many connections" from PostgreSQL

**Causes:**
- Multiple servers exceeding PostgreSQL `max_connections`
- Connection leaks

**Solutions:**
1. Reduce `DB_POOL_MAX` per server
2. Check: `(Server Count × Pool Max) < PostgreSQL max_connections`
3. Increase PostgreSQL `max_connections` (requires restart)

### Problem: High connection churn

**Symptoms:**
- Frequent connection creation/destruction
- High `pg_stat_activity` fluctuations

**Solutions:**
1. Increase `DB_POOL_MIN` to keep more connections warm
2. Increase `DB_POOL_IDLE` to keep connections alive longer

### Problem: Memory issues on PostgreSQL server

**Causes:**
- Too many connections consuming memory
- Each connection uses ~10MB of RAM

**Solutions:**
1. Reduce `DB_POOL_MAX`
2. Implement connection pooling at infrastructure level (PgBouncer)
3. Upgrade server RAM

## PgBouncer Integration (Optional)

For large deployments, consider using PgBouncer for connection pooling:

```
Application (N × 30 connections) 
    ↓
PgBouncer Pool (100 connections)
    ↓
PostgreSQL (max_connections=100)
```

**Benefits:**
- Thousands of app connections → Hundreds of DB connections
- Better resource utilization
- Reduced PostgreSQL memory usage

## Best Practices

1. **Start Conservative:** Begin with lower pool sizes and increase based on monitoring
2. **Monitor Regularly:** Track connection usage, query performance, and timeouts
3. **Use Connection Pooling:** Always use pooling in production
4. **Set Timeouts:** Prevent runaway queries with `statement_timeout`
5. **Enable SSL:** Always use SSL/TLS in production
6. **Application Name:** Set unique names per service for easier debugging
7. **Log Slow Queries:** Monitor queries exceeding `DB_MAX_QUERY_TIME`
8. **Regular Maintenance:** Close idle connections, recycle stale ones
9. **Load Testing:** Test pool configuration under production-like load
10. **Document Changes:** Track pool configuration changes and their impact

## Monitoring Queries

### Check Pool Status
```sql
SELECT 
  application_name,
  state,
  COUNT(*) as count
FROM pg_stat_activity
WHERE application_name LIKE 'mbands-%'
GROUP BY application_name, state;
```

### Find Blocking Queries
```sql
SELECT 
  blocked_locks.pid AS blocked_pid,
  blocked_activity.usename AS blocked_user,
  blocking_locks.pid AS blocking_pid,
  blocking_activity.usename AS blocking_user,
  blocked_activity.query AS blocked_statement,
  blocking_activity.query AS blocking_statement
FROM pg_catalog.pg_locks blocked_locks
JOIN pg_catalog.pg_stat_activity blocked_activity ON blocked_activity.pid = blocked_locks.pid
JOIN pg_catalog.pg_locks blocking_locks ON blocking_locks.locktype = blocked_locks.locktype
JOIN pg_catalog.pg_stat_activity blocking_activity ON blocking_activity.pid = blocking_locks.pid
WHERE NOT blocked_locks.granted AND blocking_locks.granted;
```

### Connection Age
```sql
SELECT 
  application_name,
  state,
  NOW() - backend_start AS connection_age
FROM pg_stat_activity
WHERE application_name = 'mbands-api'
ORDER BY backend_start;
```

## Additional Resources

- [node-postgres Pool Documentation](https://node-postgres.com/apis/pool)
- [PostgreSQL Connection Management](https://www.postgresql.org/docs/current/runtime-config-connection.html)
- [TypeORM Connection Options](https://typeorm.io/data-source-options)
- [HikariCP Pool Sizing](https://github.com/brettwooldridge/HikariCP/wiki/About-Pool-Sizing) (applicable concepts)
