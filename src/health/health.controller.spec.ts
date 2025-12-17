import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { HealthCheckService, TypeOrmHealthIndicator } from '@nestjs/terminus';

describe('HealthController', () => {
  let controller: HealthController;
  let healthCheckService: HealthCheckService;
  let typeOrmHealthIndicator: TypeOrmHealthIndicator;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: HealthCheckService,
          useValue: {
            check: jest.fn(),
          },
        },
        {
          provide: TypeOrmHealthIndicator,
          useValue: {
            pingCheck: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
    healthCheckService = module.get<HealthCheckService>(HealthCheckService);
    typeOrmHealthIndicator = module.get<TypeOrmHealthIndicator>(
      TypeOrmHealthIndicator,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('check', () => {
    it('should check database health', async () => {
      const mockHealthStatus = {
        status: 'ok',
        details: { database: { status: 'up' } },
      };
      jest
        .spyOn(healthCheckService, 'check')
        .mockResolvedValue(mockHealthStatus as any);
      jest
        .spyOn(typeOrmHealthIndicator, 'pingCheck')
        .mockResolvedValue({ database: { status: 'up' } } as any);

      const result = await controller.check();

      expect(healthCheckService.check).toHaveBeenCalled();
      expect(result).toEqual(mockHealthStatus);
    });

    it('should call pingCheck with correct database name', async () => {
      const mockHealthStatus = {
        status: 'ok' as any,
        details: { database: { status: 'up' } },
      };
      jest
        .spyOn(healthCheckService, 'check')
        .mockImplementation((async (indicators) => {
          // Execute the health check function
          const checkFn = indicators[0];
          await checkFn();
          return mockHealthStatus;
        }) as any);
      jest
        .spyOn(typeOrmHealthIndicator, 'pingCheck')
        .mockResolvedValue({ database: { status: 'up' } } as any);

      await controller.check();

      expect(typeOrmHealthIndicator.pingCheck).toHaveBeenCalledWith('database');
    });
  });
});
