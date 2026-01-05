# Race Conditions Analysis Report

**Date:** December 24, 2025  
**Project:** mbands-back (NestJS/TypeORM)  
**Status:** ⚠️ **CRITICAL ISSUES IDENTIFIED**

## Executive Summary

This codebase has **multiple potential race conditions** that could lead to:
- Data corruption
- Duplicate entries (users, bands, members)
- Inconsistent state
- Authentication token conflicts
- Entity relationship integrity violations

---

## 1. CRITICAL: User Registration Race Condition

### Issue
**Location:** [src/auth/auth.service.ts](src/auth/auth.service.ts#L40-L64)

```typescript
async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
  const existingUser = await this.userService.findOne(username);
  if (existingUser) {
    throw new ConflictException('Username already exists');
  }
  // ⚠️ RACE CONDITION: Between check and insert
  const newUser: Partial<User> = { ... };
  const user = await this.userService.create(newUser as User);
}
```

### Problem
1. **TOCTOU (Time-of-check Time-of-use)**: Code checks if username exists, then creates user
2. Between the `findOne()` and `save()` calls, another request could create the same username
3. If two registration requests arrive simultaneously:
   - Both pass the existence check
   - Both attempt to insert the same username
   - Only one will succeed (PostgreSQL constraint), other fails with database error
   - User gets database error instead of proper ConflictException

### Risk Level
**🔴 CRITICAL** - Causes application crashes and poor UX

### Reproduction
```bash
# Terminal 1
curl -X POST http://localhost:3000/auth/register -d '{"username":"john","password":"...","email":"john@test.com"}'

# Terminal 2 (same request, before Terminal 1 completes)
curl -X POST http://localhost:3000/auth/register -d '{"username":"john","password":"...","email":"john@test.com"}'

# Result: One succeeds, one fails with unhandled database error
```

---

## 2. CRITICAL: Duplicate Email Registration

### Issue
**Location:** [src/auth/auth.service.ts](src/auth/auth.service.ts#L50-L54)

```typescript
const existingEmail = await this.userService.findByEmail(email);
if (existingEmail) {
  throw new ConflictException('Email already exists');
}
// ⚠️ Same TOCTOU issue as username
```

### Problem
- Same TOCTOU vulnerability as username
- Emails must be unique but check is not atomic
- Could result in database constraint violation

### Risk Level
**🔴 CRITICAL**

---

## 3. CRITICAL: Band Update Race Condition

### Issue
**Location:** [src/bands/bands.service.ts](src/bands/bands.service.ts#L48-L51)

```typescript
async update(id: number, updateBandDto: UpdateBandDto): Promise<Band> {
  await this.bandsRepository.update(id, updateBandDto);
  return this.findOne(id);  // ⚠️ Dirty read possible
}
```

### Problem
1. Update completes
2. Between `update()` and `findOne()`, another request could modify the same band
3. Returned data may not match what was actually updated
4. **Lost Update Problem**: If two concurrent requests update different fields:
   - Request A: updates name
   - Request B: updates genre
   - One of them will overwrite the other's changes if not using optimistic locking

### Example Scenario
```
Time  Request 1          Request 2
---   ---------          ---------
T1    GET Band #1        GET Band #1
      (name="Metallica", genre="Metal")
T2    PATCH (name="Iron Maiden")
T3                       PATCH (genre="Rock")
T4    Save (name="Iron Maiden", genre="Metal")
T5                       Save (name="Metallica", genre="Rock")
Result: Genre change from Request 2 is lost!
```

### Risk Level
**🔴 CRITICAL** - Silent data loss

---

## 4. CRITICAL: Album-Song Relationship Race Condition

### Issue
**Location:** [src/albums/albums.service.ts](src/albums/albums.service.ts)

### Problem
- Many-to-many relationships between Album and Song
- No transaction protection
- Two concurrent operations could corrupt join table:
  - Adding song to album
  - Deleting album
- Results in orphaned or missing relationships

### Risk Level
**🔴 CRITICAL**

---

## 5. HIGH: Refresh Token Race Condition

### Issue
**Location:** [src/auth/auth.service.ts](src/auth/auth.service.ts#L107-L125)

```typescript
private async buildAuthResponse(user: User): Promise<AuthResponseDto> {
  // ...
  const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
  await this.userService.updateRefreshToken(
    user.userId,
    refreshTokenHash,
    refreshExpiresAt,
  );
  // ⚠️ Multiple concurrent logins overwrite each other's tokens
}
```

### Problem
1. User logs in simultaneously on two devices
2. Both generate refresh tokens
3. Both try to update the user's `refreshTokenHash`
4. Second update overwrites first
5. Device 1's token becomes invalid

### Risk Level
**🟠 HIGH** - Security/UX issue

---

## 6. HIGH: Member Join/Leave Date Race Condition

### Issue
**Location:** [src/members/members.service.ts](src/members/members.service.ts)

### Problem
- `joinDate`, `leaveDate`, and `isActive` status
- No transaction
- Could mark member as active while setting leaveDate
- Concurrent updates could create invalid state

### Risk Level
**🟠 HIGH**

---

## 7. HIGH: Event Status Update Race Condition

### Issue
**Location:** [src/events/events.service.ts](src/events/events.service.ts#L32)

### Problem
- Event has `isActive` flag
- Two concurrent requests could both check and update:
  - Request A checks if active, cancels
  - Request B checks if active, confirms tickets
  - Both see active=true, both proceed
  - Tickets confirmed after cancellation

### Risk Level
**🟠 HIGH** - Business logic error

---

## 8. MEDIUM: Soft Delete Race Condition

### Issue
**Location:** Multiple services (bands, albums, members, events)

```typescript
async remove(id: number): Promise<UpdateResult> {
  return this.bandsRepository.softDelete(id);
}
```

### Problem
- Soft delete sets `deletedAt` timestamp
- No transaction protection
- Two concurrent deletes could:
  - Both check if deleted
  - Both attempt delete
  - First succeeds, second fails or creates inconsistency

### Risk Level
**🟡 MEDIUM**

---

## 9. MEDIUM: Country Deactivation Race Condition

### Issue
**Location:** [src/countries/countries.controller.ts](src/countries/countries.controller.ts#L67)

### Problem
- Dedicated deactivate endpoint: `PATCH '/countries/:id/deactivate'`
- While deactivating, other request could activate
- No optimistic locking

### Risk Level
**🟡 MEDIUM**

---

## 10. MEDIUM: Pagination Consistency Issue

### Issue
**Location:** Multiple `findAll()` methods with pagination

### Problem
- Using `skip/take` without ordering guarantees
- Concurrent inserts could cause:
  - Duplicate rows in paginated results
  - Skipped rows on subsequent pages
  - User sees inconsistent data across pages

### Risk Level
**🟡 MEDIUM**

---

## 11. MEDIUM: Connection Pool Exhaustion

### Issue
**Location:** [src/app.module.ts](src/app.module.ts#L56-L77)

### Problem
- No connection pooling at database transaction level
- Long-running operations hold connections
- Under load, pool exhaustion leads to "connection timeout"
- Application becomes unresponsive

### Risk Level
**🟡 MEDIUM**

---

## Solutions & Recommendations

### 1. **Implement Database-Level Constraints** 🔴 CRITICAL

Use PostgreSQL unique constraints instead of application checks:

```sql
-- Already has these:
ALTER TABLE "user" 
  ADD CONSTRAINT "UQ_user_username" UNIQUE ("username"),
  ADD CONSTRAINT "UQ_user_email" UNIQUE ("email");

-- User service should rely on database, not app-level checks
```

**Fix for auth.service.ts:**
```typescript
async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
  try {
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const newUser = await this.userService.create({
      username: registerDto.username,
      email: registerDto.email,
      password: hashedPassword,
      firstName: registerDto.firstName || null,
      lastName: registerDto.lastName || null,
      isActive: true,
    } as User);
    return this.buildAuthResponse(newUser);
  } catch (error) {
    if (error.code === '23505') {
      // PostgreSQL unique constraint violation
      throw new ConflictException('Username or email already exists');
    }
    throw error;
  }
}
```

### 2. **Implement Optimistic Locking** 🔴 CRITICAL

Add `version` field to entities to prevent lost updates:

```typescript
// In entity
@Entity()
export class Band {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Version()
  version: number;

  // ... other fields
}
```

Update service:
```typescript
async update(id: number, updateBandDto: UpdateBandDto): Promise<Band> {
  const band = await this.findOne(id);
  if (!band) throw new NotFoundException('Band not found');
  
  // Include version in update to detect concurrent modifications
  const result = await this.bandsRepository.update(
    { id, version: band.version },
    updateBandDto
  );
  
  if (result.affected === 0) {
    throw new ConflictException(
      'Band was modified by another user. Please refresh and try again.'
    );
  }
  
  return this.findOne(id);
}
```

### 3. **Use Database Transactions** 🔴 CRITICAL

```typescript
async update(id: number, updateBandDto: UpdateBandDto): Promise<Band> {
  const queryRunner = this.dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const band = await queryRunner.manager.findOne(Band, {
      where: { id },
      lock: { mode: 'pessimistic_write' } // Lock for update
    });

    if (!band) {
      throw new NotFoundException('Band not found');
    }

    Object.assign(band, updateBandDto);
    await queryRunner.manager.save(band);
    await queryRunner.commitTransaction();
    
    return band;
  } catch (error) {
    await queryRunner.rollbackTransaction();
    throw error;
  } finally {
    await queryRunner.release();
  }
}
```

### 4. **Fix Refresh Token Handling** 🟠 HIGH

```typescript
async buildAuthResponse(user: User): Promise<AuthResponseDto> {
  const payload = {
    sub: user.userId,
    username: user.username,
    email: user.email,
  };

  const tokens = this.generateTokens(payload);
  const refreshTokenHash = await bcrypt.hash(tokens.refreshToken, 10);

  // Use transaction to ensure atomic update
  const queryRunner = this.dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    await queryRunner.manager.update(
      User,
      { userId: user.userId },
      {
        refreshTokenHash,
        refreshTokenExpiresAt: tokens.refreshExpiresAt,
        lastLoginAt: new Date(),
      }
    );
    await queryRunner.commitTransaction();
  } finally {
    await queryRunner.release();
  }

  return {
    access_token: tokens.accessToken,
    refresh_token: tokens.refreshToken,
    user: { ... }
  };
}
```

### 5. **Add Pagination Ordering** 🟡 MEDIUM

```typescript
async findAll(pagination?: PaginationQueryDto): Promise<Band[]> {
  const { skip, take } = buildPaginationParams(pagination);
  return this.bandsRepository.find({
    skip,
    take,
    order: { id: 'ASC' }, // Stable ordering prevents duplicates/gaps
    relations: { /* ... */ },
  });
}
```

### 6. **Implement Event State Machine** 🟠 HIGH

```typescript
@Entity()
export class Event {
  @Column({
    type: 'enum',
    enum: EventStatus,
    default: EventStatus.SCHEDULED
  })
  status: EventStatus;
}

enum EventStatus {
  SCHEDULED = 'scheduled',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

// In service
async cancelEvent(id: number): Promise<Event> {
  const event = await this.eventsRepository.findOne({ where: { id } });
  
  if (![EventStatus.SCHEDULED, EventStatus.CONFIRMED].includes(event.status)) {
    throw new BadRequestException(
      `Cannot cancel event with status: ${event.status}`
    );
  }

  // Atomic state transition
  const result = await this.eventsRepository.update(
    { id, status: In([EventStatus.SCHEDULED, EventStatus.CONFIRMED]) },
    { status: EventStatus.CANCELLED }
  );

  if (result.affected === 0) {
    throw new ConflictException('Event status changed by another user');
  }

  return this.eventsRepository.findOne({ where: { id } });
}
```

---

## Implementation Priority

### Phase 1 (Do Immediately - Production Blocking)
1. ✅ Add database unique constraints (already in place)
2. ❌ Remove app-level duplicate checks, rely on DB
3. ❌ Implement try/catch for unique constraint violations
4. ❌ Add optimistic locking to Band, Album, Event entities

### Phase 2 (This Sprint)
5. ❌ Implement transactions for multi-step operations
6. ❌ Fix refresh token handling with atomic updates
7. ❌ Add stable ordering to pagination queries

### Phase 3 (Next Sprint)
8. ❌ Implement event state machine pattern
9. ❌ Add member lifecycle state validation
10. ❌ Implement connection pool monitoring

---

## Testing Strategy

### Unit Tests
```typescript
describe('AuthService Race Conditions', () => {
  it('should handle concurrent registration with same username', async () => {
    const registerDto = { username: 'john', email: 'john@test.com', password: '...' };
    
    const [result1, result2] = await Promise.allSettled([
      authService.register(registerDto),
      authService.register(registerDto),
    ]);

    // One should succeed, one should fail with ConflictException
    expect(result1.status).toBe('fulfilled');
    expect(result2.status).toBe('rejected');
    expect(result2.reason).toBeInstanceOf(ConflictException);
  });
});
```

### Integration Tests
- Concurrent API requests with load testing tool (k6, Apache JMeter)
- Verify no duplicate records created
- Verify data consistency after concurrent operations

### Database Tests
```sql
-- Check for duplicate users
SELECT username, COUNT(*) 
FROM "user" 
GROUP BY username 
HAVING COUNT(*) > 1;

-- Verify constraint violations are properly caught
```

---

## Migration Checklist

- [ ] Add `@Version()` decorator to Band, Album, Event, Member entities
- [ ] Create migration for version columns
- [ ] Update all `update()` methods in services to check version
- [ ] Wrap multi-step operations in transactions
- [ ] Add error handling for OptimisticLockVersionMismatchError
- [ ] Add tests for race condition scenarios
- [ ] Performance test to ensure locking doesn't degrade throughput
- [ ] Update API documentation with optimistic lock error responses

---

## References

- [TypeORM Optimistic Concurrency Control](https://typeorm.io/eager-and-lazy-relations)
- [PostgreSQL Locking](https://www.postgresql.org/docs/current/explicit-locking.html)
- [NestJS Database Transactions](https://docs.nestjs.com/techniques/database)
- [OWASP Race Conditions](https://owasp.org/www-community/attacks/Race_condition)

---

## Conclusion

**This codebase has critical race condition vulnerabilities that must be fixed before production deployment.** The most urgent issues are:

1. User registration with duplicate username/email
2. Lost updates in band/album/event modifications
3. Refresh token conflicts during concurrent logins

Implementing optimistic locking and database transactions will resolve most issues with minimal performance impact.
