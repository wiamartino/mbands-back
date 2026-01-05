# Performance Testing Suite

## Overview

A comprehensive performance testing suite that measures and monitors the performance of your NestJS API, including response times, throughput, memory usage, and load testing capabilities.

## Test Files

### 1. `test/performance.e2e-spec.ts` (E2E Performance Tests)
End-to-end performance tests that measure real HTTP request/response cycles.

**Test Categories:**
- Response time benchmarks
- Concurrent request handling (10, 25, 50+ concurrent requests)
- Memory performance and leak detection
- Error handling performance
- Request size impact analysis
- Throughput metrics
- Response time distribution (min, max, median, P95, P99)
- Performance degradation analysis
- Interceptor and filter overhead

**Run with:**
```bash
npm run test:e2e -- test/performance.e2e-spec.ts
```

### 2. `test/performance.unit-spec.ts` (Component Performance Tests)
Unit-level performance tests for individual components (filters, interceptors).

**Test Categories:**
- HttpExceptionFilter performance (1000+ iterations)
- LoggingInterceptor performance
- Large payload handling
- Sensitive field redaction performance
- Comparative analysis between components

**Run with:**
```bash
npm run test:performance
```

### 3. `test/load-test.ts` (Load Testing Script)
Standalone load testing script for simulating high-load scenarios.

**Test Scenarios:**
- Light Load: 100 requests, 10 concurrency
- Medium Load: 500 requests, 25 concurrency
- Heavy Load: 1000 requests, 50 concurrency
- Extreme Load: 2000 requests, 100 concurrency

**Run with:**
```bash
npm run test:load
```

## Performance Thresholds

```typescript
const PERFORMANCE_THRESHOLDS = {
  FAST_ENDPOINT: 50,        // ms - should complete in under 50ms
  NORMAL_ENDPOINT: 200,     // ms - normal operations under 200ms
  SLOW_ENDPOINT: 1000,      // ms - slower operations under 1s
  DATABASE_QUERY: 100,      // ms - database queries under 100ms
};
```

Adjust these based on your production SLAs.

## Running Performance Tests

### Run All Performance Tests
```bash
npm run test:performance
```

### Run E2E Performance Tests
```bash
npm run test:e2e -- test/performance.e2e-spec.ts
```

### Run Load Tests
```bash
npm run test:load
```

### Run with Coverage
```bash
npm run test:cov -- test/performance.e2e-spec.ts
```

### Run in Watch Mode (for development)
```bash
npm run test:watch -- test/performance
```

## Test Metrics

### Response Time Metrics
- **Min**: Minimum response time
- **Max**: Maximum response time
- **Average (Avg)**: Mean response time
- **Median (P50)**: 50th percentile
- **P95**: 95th percentile (95% of requests are faster)
- **P99**: 99th percentile (99% of requests are faster)

### Throughput Metrics
- **Requests/second**: Total throughput of the API
- **Request count**: Total number of requests processed
- **Success rate**: Percentage of successful requests

### Memory Metrics
- **RSS**: Resident set size (total memory allocated)
- **Heap Used**: Memory currently used by the application
- **Heap Total**: Total heap size allocated
- **Per-request overhead**: Memory increase per request

## Example Output

### E2E Performance Test Output
```
Response Time Benchmarks
  ✓ GET / should respond within fast threshold (5ms)
  ✓ GET /api/doc should respond within normal threshold (12ms)
  ✓ should complete multiple sequential requests within threshold
    Sequential Requests: 5 requests in 32ms (avg: 6.40ms)

Concurrent Request Handling
  ✓ should handle 10 concurrent requests
    Concurrent Requests: 10 requests in 45ms (avg: 4.50ms)
  ✓ should handle 25 concurrent requests
    Concurrent Requests: 25 requests in 95ms (avg: 3.80ms)
  ✓ should handle 50 concurrent requests
    Concurrent Requests: 50 requests in 180ms (avg: 3.60ms)

Throughput Metrics
  ✓ should provide throughput statistics for rapid requests
    Throughput Metrics:
      Requests: 100
      Duration: 320ms
      Throughput: 312.50 req/s
      Average Response: 3.20ms
```

### Unit Performance Test Output
```
Component Performance Tests
  HttpExceptionFilter Performance
    ✓ should process exception with minimal overhead
      Exception Filter: 0.0045ms per call (1000 iterations)
    ✓ should handle large error responses efficiently
      Exception Filter (large payload): 0.0120ms per call

  LoggingInterceptor Performance
    ✓ should process request with minimal overhead
      Logging Interceptor: 0.0089ms per call (100 iterations)
    ✓ should efficiently redact sensitive fields
      Logging Interceptor (redaction): 0.0234ms per call (200 iterations)
```

### Load Test Output
```
📊 Running Load Test: Light Load
   Endpoint: /, Requests: 100, Concurrency: 10
   Progress: 100% (100/100)
   📈 Results:
   ├─ Success: 100/100 (100%)
   ├─ Errors: 0
   ├─ Total Duration: 320ms
   ├─ Throughput: 312.50 req/s
   └─ Response Times:
      ├─ Min: 2ms
      ├─ Max: 15ms
      ├─ Avg: 3.20ms
      ├─ Median: 3ms
      ├─ P95: 8ms
      └─ P99: 12ms
```

## Performance Baselines

Document your baseline performance metrics here. Update after optimizations.

### Current Baselines (Update as you optimize)

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Root endpoint P99 | < 50ms | TBD | ⏳ |
| Avg concurrent (10) | < 200ms | TBD | ⏳ |
| Avg concurrent (50) | < 400ms | TBD | ⏳ |
| Memory per request | < 100KB | TBD | ⏳ |
| Exception filter overhead | < 0.1ms | TBD | ⏳ |
| Logging interceptor overhead | < 0.5ms | TBD | ⏳ |
| Throughput (100 req) | > 100 req/s | TBD | ⏳ |

## Performance Monitoring

### Key Metrics to Monitor
1. **Response Time P95/P99** - Use for SLA tracking
2. **Throughput** - Requests per second
3. **Error Rate** - Percentage of failed requests
4. **Memory Usage** - Heap size and growth
5. **CPU Usage** - During load tests

### Best Practices

1. **Regular Testing**
   - Run performance tests on each deployment
   - Set up CI/CD pipeline to run tests automatically
   - Track metrics over time

2. **Baseline Comparison**
   - Document baseline metrics before changes
   - Compare after optimizations
   - Flag regressions immediately

3. **Load Testing Schedule**
   - Weekly: Run light to medium loads
   - Monthly: Run heavy/extreme loads
   - Before release: Full test suite

4. **Real-World Scenarios**
   - Test with realistic data sizes
   - Simulate peak traffic patterns
   - Test error scenarios

## Performance Optimization Tips

### Based on Test Results

1. **High Response Times**
   - Check database query performance
   - Look for synchronous operations
   - Consider caching frequently accessed data

2. **Memory Issues**
   - Check for memory leaks (use `--inspect` flag)
   - Monitor object creation patterns
   - Review middleware/interceptor implementations

3. **Throughput Issues**
   - Increase concurrency handling
   - Review bottleneck endpoints
   - Optimize database connections

4. **Uneven Response Times**
   - Check for cascading requests
   - Monitor external API calls
   - Review query complexity

## Integration with CI/CD

### GitHub Actions Example

```yaml
name: Performance Tests

on: [push, pull_request]

jobs:
  performance:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: npm run test:performance
      - run: npm run test:load
```

## Troubleshooting

### Tests Timing Out
- Increase `testTimeout` in `jest-performance.json`
- Check system resources (CPU, memory)
- Reduce concurrent request count

### High Memory Usage
- Run tests individually
- Use `--inspect` to check for leaks
- Increase Node.js heap size: `--max-old-space-size=4096`

### Inconsistent Results
- Close other applications
- Disable background processes
- Run multiple times and average results
- Use consistent load parameters

## Advanced Usage

### Custom Performance Thresholds

Update thresholds in `test/performance.e2e-spec.ts`:

```typescript
const PERFORMANCE_THRESHOLDS = {
  FAST_ENDPOINT: 100,        // Adjust for your needs
  NORMAL_ENDPOINT: 300,
  SLOW_ENDPOINT: 1500,
  DATABASE_QUERY: 200,
};
```

### Custom Load Test Scenarios

Extend `LoadTester` class in `test/load-test.ts`:

```typescript
// Add to main() function
results['custom'] = await tester.runLoadTest(
  'Custom Test',
  '/api/bands',
  5000,
  100,
);
```

### Performance Regression Detection

Compare current results with baselines:

```bash
npm run test:performance > current-results.txt
# Compare with baseline
diff baseline-results.txt current-results.txt
```

## Metrics Collection

### For Production Monitoring

Export results to file:

```bash
npm run test:performance 2>&1 | tee performance-results.json
```

Track over time using:
- **Prometheus** for metrics
- **Grafana** for visualization
- **ELK Stack** for log aggregation
- **DataDog** or **New Relic** for APM

## Next Steps

1. ✅ Run baseline performance tests
2. ✅ Document current metrics
3. ✅ Set realistic thresholds
4. ✅ Integrate into CI/CD pipeline
5. ✅ Monitor trends over time
6. ✅ Optimize based on results

## Resources

- [NestJS Performance Optimization](https://docs.nestjs.com/techniques/performance)
- [Jest Performance Documentation](https://jestjs.io/docs/timer-mocks)
- [Node.js Performance Hooks](https://nodejs.org/api/perf_hooks.html)
- [Load Testing Best Practices](https://en.wikipedia.org/wiki/Load_testing)

## Support

For performance issues or questions:
1. Check the test output for specific bottlenecks
2. Review the performance metrics
3. Consult NestJS documentation
4. Use Node.js profiling tools (`--inspect`)
