# Integration & Deployment Guide

## Overview

This guide provides step-by-step instructions for integrating and deploying the critical race condition fixes to production.

---

## Pre-Deployment Checklist

### Code Review
- [ ] Review [RACE_CONDITIONS_ANALYSIS.md](RACE_CONDITIONS_ANALYSIS.md) for vulnerability details
- [ ] Review [RACE_CONDITIONS_FIXES.md](RACE_CONDITIONS_FIXES.md) for implementation details
- [ ] Review all modified files for code quality
- [ ] Verify no breaking changes to API contracts

### Testing
- [ ] Run unit tests: `npm run test`
- [ ] Run e2e tests: `npm run test:e2e`
- [ ] Run coverage: `npm run test:cov`
- [ ] Manual testing of race condition scenarios

### Database
- [ ] Backup production database
- [ ] Test migration on staging database
- [ ] Verify rollback procedure

---

## Deployment Procedure

### Step 1: Backup Database

```bash
# On production server
pg_dump -h localhost -U postgres mbands > \
  /backups/mbands-backup-$(date +%Y%m%d-%H%M%S).sql

# Verify backup
file /backups/mbands-backup-*.sql
```

### Step 2: Build and Test Locally

```bash
# In development environment
npm run build
npm run test
npm run test:e2e

# Verify build output
ls -la dist/
```

### Step 3: Deploy New Code

```bash
# Option A: Using Git
git pull origin main
npm ci  # Clean install
npm run build

# Option B: Using npm package
npm install --production

# Verify binary
./dist/main.js --version
```

### Step 4: Run Database Migration

```bash
# In production environment (during maintenance window)
npm run migration:run

# Verify migration
npm run migration:show
```

**Migration Output:**
```
[x] 1721475600000-ImproveSchema
[x] 1753712366074-AddCountryTable
[x] 1734974400000-AddOptimisticLocking  ← NEW
```

### Step 5: Verify Schema Changes

```sql
-- Connect to production database
psql -h localhost -U postgres -d mbands

-- Check version columns
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name IN ('band', 'album', 'event')
  AND column_name = 'version'
ORDER BY table_name;

-- Should return 3 rows with type 'integer' and default '1'
```

### Step 6: Restart Application

```bash
# Stop current application
pkill -f "node.*dist/main"
# or for PM2
pm2 restart mbands-back

# Verify startup logs
tail -f logs/app.log
```

### Step 7: Smoke Tests

```bash
# Test basic endpoints
curl -s http://localhost:3000/v1/health | jq .
curl -s http://localhost:3000/api/docs | head -5

# Test authentication
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test"}'
```

---

## Rollback Procedure

If issues occur, follow these steps to rollback:

### Step 1: Stop Application

```bash
pkill -f "node.*dist/main"
# or
pm2 stop mbands-back
```

### Step 2: Revert Code

```bash
git checkout HEAD~1  # Go back one commit
npm ci
npm run build
```

### Step 3: Rollback Database

```bash
# Two options:

# Option A: Run down migration (preferred)
npm run migration:revert

# Verify rollback
SELECT COUNT(*) FROM information_schema.columns
WHERE column_name = 'version' AND table_name IN ('band', 'album', 'event');
# Should return 0

# Option B: Restore from backup (if needed)
psql -h localhost -U postgres -d mbands < backup.sql
```

### Step 4: Restart Application

```bash
npm run start:prod
# or
pm2 start "npm run start:prod" --name mbands-back
```

### Step 5: Verify System

```bash
curl http://localhost:3000/v1/health
```

---

## Monitoring Post-Deployment

### Key Metrics to Watch

1. **Application Errors**
   ```bash
   grep -i "conflict\|version\|race" logs/app.log
   ```
   - Should see 409 Conflict responses (expected for concurrent updates)
   - Should NOT see database errors

2. **Database Performance**
   ```sql
   -- Monitor slow queries
   SELECT query, mean_exec_time, stddev_exec_time
   FROM pg_stat_statements
   WHERE query LIKE '%UPDATE%'
   ORDER BY mean_exec_time DESC
   LIMIT 10;
   ```

3. **Concurrent Request Handling**
   ```bash
   # Monitor active connections
   SELECT count(*) FROM pg_stat_activity
   WHERE application_name = 'psql' AND state = 'active';
   ```

### Log Patterns

**Expected (Healthy):**
```
409 Conflict: Band was modified by another user. Please refresh and try again.
```
↑ This means optimistic locking is working - client should retry

**Unexpected (Problematic):**
```
ERROR: duplicate key value violates unique constraint "UQ_band_name"
```
↑ This should NOT appear if app-level checks are working

---

## Testing Race Conditions

### Manual Load Test

```bash
# Create concurrent registration requests
for i in {1..10}; do
  curl -X POST http://localhost:3000/auth/register \
    -H "Content-Type: application/json" \
    -d "{
      \"username\": \"user-$i\",
      \"password\": \"password123\",
      \"email\": \"user$i@test.com\"
    }" &
done
wait

# Check results - should have 10 successful registrations
curl http://localhost:3000/users | jq '.data | length'
```

### Concurrent Update Test

```bash
# Get band ID
BAND_ID=$(curl -s http://localhost:3000/bands | jq '.data[0].id')

# Concurrent update attempts
curl -X PATCH http://localhost:3000/bands/$BAND_ID \
  -H "Content-Type: application/json" \
  -d '{"name": "Update 1"}' &

curl -X PATCH http://localhost:3000/bands/$BAND_ID \
  -H "Content-Type: application/json" \
  -d '{"genre": "Rock"}' &

wait

# Check log - should see one success and one 409 Conflict
grep "409\|200" logs/app.log | tail -5
```

---

## Performance Verification

### Before & After Comparison

```bash
# Run performance test
npm run test:performance

# Monitor metrics
curl http://localhost:3000/v1/health/db
```

### Expected Results
- ✅ No performance degradation
- ✅ Response times consistent
- ✅ Database connections stable
- ✅ Memory usage unchanged

---

## Client-Side Updates

### API Response Changes

Clients need to handle new 409 Conflict response:

```javascript
// JavaScript/TypeScript example
async function updateBand(bandId, updates) {
  try {
    const response = await fetch(`/api/bands/${bandId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
      headers: { 'Content-Type': 'application/json' }
    });

    if (response.status === 409) {
      // ✅ NEW: Handle concurrent modification
      console.log('Band was modified. Refreshing...');
      const band = await fetch(`/api/bands/${bandId}`).then(r => r.json());
      // Retry with new version or show error to user
      return band;
    }

    if (!response.ok) throw new Error(response.statusText);
    return response.json();
  } catch (error) {
    console.error('Update failed:', error);
  }
}
```

### Documentation Update

- [ ] Update API documentation for 409 responses
- [ ] Add migration guide to client library
- [ ] Update error handling examples
- [ ] Notify API consumers of changes

---

## Troubleshooting

### Issue: Migration Fails with "Column Already Exists"

**Solution:**
```sql
-- Check if columns exist
SELECT column_name FROM information_schema.columns
WHERE table_name = 'band' AND column_name = 'version';

-- If exists, set default
ALTER TABLE "band" ALTER COLUMN "version" SET DEFAULT 1;
```

### Issue: Concurrent Updates Always Return 409

**Solution:**
```bash
# Check version column
SELECT * FROM band LIMIT 1;  # Should see version = 1

# Verify index exists
\d band  # Should show index on (id, version)

# If missing, create it:
CREATE INDEX idx_band_id_version ON band(id, version);
```

### Issue: Old Clients Still Use App-Level Checks

**Solution:**
```bash
# Temporarily enable app-level checks for compatibility
# Set feature flag in config:
ALLOW_LEGACY_CHECKS=true npm run start:prod

# Gradual migration:
# 1. Deploy with feature flag enabled
# 2. Monitor client versions
# 3. Disable flag after all clients updated
```

---

## Communication Plan

### Pre-Deployment (24 hours before)
- Email stakeholders about maintenance window
- Document expected behavior changes (409 responses)
- Provide client-side update examples

### During Deployment
- Monitor logs in real-time
- Keep Slack/Teams channel open for issues
- Have rollback plan ready

### Post-Deployment (24-48 hours)
- Monitor error rates
- Check performance metrics
- Gather feedback from users
- Document lessons learned

---

## Success Criteria

Deployment is successful when:

- [x] Build completes without errors
- [x] Migration runs without errors
- [x] All endpoints respond correctly
- [x] Unit tests pass (100% of modified code)
- [x] E2E tests pass
- [x] No unexpected 5xx errors in logs
- [x] Concurrent requests handled correctly (409 when expected)
- [x] Database performance unchanged
- [x] Application memory usage stable

---

## Rollback Criteria

Rollback if any of these occur:

- ❌ Database migration fails
- ❌ Application fails to start
- ❌ Unexpected 5xx errors (>1% of requests)
- ❌ Query performance degrades >20%
- ❌ Concurrent requests cause data corruption
- ❌ Database connections exceed limits

---

## Post-Deployment Sign-Off

```
Deployment Date: ________________
Deployed By: ___________________
Verified By: ___________________

✅ Code deployed and running
✅ Database migration successful
✅ All smoke tests passed
✅ Performance verified
✅ Clients notified

Rollback Plan Ready: YES / NO
Emergency Contact: ______________
```

---

## Additional Resources

- **Detailed Analysis:** [RACE_CONDITIONS_ANALYSIS.md](RACE_CONDITIONS_ANALYSIS.md)
- **Implementation Details:** [RACE_CONDITIONS_FIXES.md](RACE_CONDITIONS_FIXES.md)
- **Summary:** [CRITICAL_FIXES_SUMMARY.md](CRITICAL_FIXES_SUMMARY.md)
- **Test Files:** 
  - src/auth/auth.service.race-condition.spec.ts
  - src/bands/bands.service.optimistic-locking.spec.ts
- **Migration:** src/migrations/1734974400000-AddOptimisticLocking.ts

---

## Support

For questions or issues during deployment:

1. Check logs: `tail -f logs/app.log`
2. Review analysis: [RACE_CONDITIONS_ANALYSIS.md](RACE_CONDITIONS_ANALYSIS.md)
3. Check test files for expected behavior
4. Contact: [technical-lead@example.com]

---

**Last Updated:** December 24, 2025  
**Status:** Ready for Deployment
