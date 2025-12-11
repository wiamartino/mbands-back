import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { LoggingInterceptor } from '../src/common/interceptors/logging.interceptor';

/**
 * Load Testing Script
 *
 * This script simulates high-load scenarios to identify bottlenecks
 * and measure performance under stress.
 *
 * Run with: npm run test -- test/load-test.ts
 * Or directly: ts-node test/load-test.ts
 */

interface LoadTestResult {
  totalRequests: number;
  successCount: number;
  errorCount: number;
  totalDuration: number;
  minResponseTime: number;
  maxResponseTime: number;
  avgResponseTime: number;
  medianResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  throughput: number; // requests per second
}

class LoadTester {
  private app: INestApplication;

  async setup(): Promise<void> {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    this.app = moduleFixture.createNestApplication();

    // Apply global middleware
    this.app.useGlobalInterceptors(new LoggingInterceptor());
    this.app.useGlobalFilters(new HttpExceptionFilter());
    this.app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await this.app.init();
  }

  async teardown(): Promise<void> {
    await this.app.close();
  }

  async runLoadTest(
    testName: string,
    endpoint: string,
    totalRequests: number,
    concurrency: number,
  ): Promise<LoadTestResult> {
    console.log(`\n📊 Running Load Test: ${testName}`);
    console.log(
      `   Endpoint: ${endpoint}, Requests: ${totalRequests}, Concurrency: ${concurrency}`,
    );

    const responseTimes: number[] = [];
    let successCount = 0;
    let errorCount = 0;
    const statusCodes: Record<number, number> = {};

    const startTime = Date.now();

    // Process requests in batches to manage concurrency
    for (let i = 0; i < totalRequests; i += concurrency) {
      const batchSize = Math.min(concurrency, totalRequests - i);
      const batch = Array.from({ length: batchSize }).map(() =>
        this.makeRequest(endpoint, responseTimes),
      );

      const results = await Promise.allSettled(batch);

      results.forEach((result) => {
        if (result.status === 'fulfilled') {
          const { success, status } = result.value;
          if (status) {
            statusCodes[status] = (statusCodes[status] || 0) + 1;
          }
          if (success) {
            successCount++;
          } else if (status !== 429) {
            // Don't count rate-limited responses as errors (they're expected)
            errorCount++;
          }
        } else {
          errorCount++;
        }
      });

      // Log progress
      const completed = Math.min(i + batchSize, totalRequests);
      const percentage = ((completed / totalRequests) * 100).toFixed(1);
      process.stdout.write(
        `\r   Progress: ${percentage}% (${completed}/${totalRequests})`,
      );
    }

    const totalDuration = Date.now() - startTime;

    console.log(`\n`);

    // Calculate statistics
    const sorted = [...responseTimes].sort((a, b) => a - b);
    const result: LoadTestResult = {
      totalRequests,
      successCount,
      errorCount,
      totalDuration,
      minResponseTime: sorted[0] || 0,
      maxResponseTime: sorted[sorted.length - 1] || 0,
      avgResponseTime:
        responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length || 0,
      medianResponseTime: sorted[Math.floor(sorted.length / 2)] || 0,
      p95ResponseTime: sorted[Math.floor(sorted.length * 0.95)] || 0,
      p99ResponseTime: sorted[Math.floor(sorted.length * 0.99)] || 0,
      throughput: (totalRequests / totalDuration) * 1000,
    };

    this.printResults(result, statusCodes);
    return result;
  }

  private async makeRequest(
    endpoint: string,
    responseTimes: number[],
  ): Promise<{ success: boolean; status?: number }> {
    const startTime = Date.now();

    try {
      const response = await request(this.app.getHttpServer()).get(endpoint);
      const duration = Date.now() - startTime;
      responseTimes.push(duration);

      return { success: response.status < 400, status: response.status };
    } catch (error: any) {
      const duration = Date.now() - startTime;
      responseTimes.push(duration);
      const status = error?.response?.status || error?.status || 0;
      return { success: false, status };
    }
  }

  private printResults(result: LoadTestResult, statusCodes?: Record<number, number>): void {
    console.log(`   📈 Results:`);
    console.log(
      `   ├─ Success: ${result.successCount}/${result.totalRequests} (${((result.successCount / result.totalRequests) * 100).toFixed(1)}%)`,
    );
    console.log(`   ├─ Errors: ${result.errorCount}`);
    if (statusCodes && Object.keys(statusCodes).length > 0) {
      const statusStr = Object.entries(statusCodes)
        .map(([code, count]) => `${code}:${count}`)
        .join(', ');
      console.log(`   ├─ Status Codes: ${statusStr}`);
    }
    console.log(`   ├─ Total Duration: ${result.totalDuration}ms`);
    console.log(`   ├─ Throughput: ${result.throughput.toFixed(2)} req/s`);
    console.log(`   └─ Response Times:`);
    console.log(`      ├─ Min: ${result.minResponseTime}ms`);
    console.log(`      ├─ Max: ${result.maxResponseTime}ms`);
    console.log(`      ├─ Avg: ${result.avgResponseTime.toFixed(2)}ms`);
    console.log(`      ├─ Median: ${result.medianResponseTime}ms`);
    console.log(`      ├─ P95: ${result.p95ResponseTime}ms`);
    console.log(`      └─ P99: ${result.p99ResponseTime}ms`);
  }
}

/**
 * Main execution
 */
async function main(): Promise<void> {
  console.log(`\n🚀 Starting Load Tests\n`);

  const tester = new LoadTester();

  try {
    await tester.setup();

    // Run various load test scenarios
    const results: Record<string, LoadTestResult> = {};

    // Test 1: Light load
    results['light'] = await tester.runLoadTest('Light Load', '/', 100, 10);

    // Test 2: Medium load
    results['medium'] = await tester.runLoadTest('Medium Load', '/', 500, 25);

    // Test 3: Heavy load
    results['heavy'] = await tester.runLoadTest('Heavy Load', '/', 1000, 50);

    // Test 4: Extreme load (be careful with this)
    results['extreme'] = await tester.runLoadTest(
      'Extreme Load',
      '/',
      2000,
      100,
    );

    // Print summary
    console.log(`\n\n📊 Load Test Summary\n`);
    console.log(
      `${'Test'.padEnd(20)} | ${'Throughput'.padEnd(12)} | ${'Avg (ms)'.padEnd(10)} | ${'P95 (ms)'.padEnd(10)} | ${'P99 (ms)'.padEnd(10)}`,
    );
    console.log(
      `${'-'.repeat(20)}-+-${'-'.repeat(12)}-+-${'-'.repeat(10)}-+-${'-'.repeat(10)}-+-${'-'.repeat(10)}`,
    );

    Object.entries(results).forEach(([name, result]) => {
      console.log(
        `${name.padEnd(20)} | ${result.throughput.toFixed(2).padEnd(12)} | ${result.avgResponseTime.toFixed(2).padEnd(10)} | ${result.p95ResponseTime.toString().padEnd(10)} | ${result.p99ResponseTime.toString().padEnd(10)}`,
      );
    });

    console.log(`\n✅ Load tests completed successfully\n`);
  } catch (error) {
    console.error(`❌ Load test failed:`, error);
    process.exit(1);
  } finally {
    await tester.teardown();
  }
}

// Run only if executed directly
if (require.main === module) {
  main().catch(console.error);
}

export { LoadTester };
