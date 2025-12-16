import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import * as Joi from 'joi';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthModule } from './health/health.module';
import { BandsModule } from './bands/bands.module';
import { MembersModule } from './members/members.module';
import { AlbumsModule } from './albums/albums.module';
import { SongsModule } from './songs/songs.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { EventsModule } from './events/events.module';
import { CountriesModule } from './countries/countries.module';
import { Band } from './bands/entities/band.entity';
import { Member } from './members/entities/member.entity';
import { Album } from './albums/entities/album.entity';
import { Song } from './songs/entities/song.entity';
import { User } from './users/entities/user.entity';
import { Role } from './users/entities/role.entity';
import { Event } from './events/entities/event.entity';
import { Country } from './countries/entities/country.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'test', 'production')
          .default('development'),
        PORT: Joi.number().default(3000),
        FRONTEND_URL: Joi.string().uri().optional(),
        JWT_SECRET: Joi.string().min(16).required(),
        DATABASE_URL: Joi.string().required(),
      }),
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 100, // max 100 requests per minute (global default)
      },
    ]),
    TypeOrmModule.forRootAsync({
      useFactory: () => {
        const isProduction = process.env.NODE_ENV === 'production';
        const isTest = process.env.NODE_ENV === 'test';

        return {
          type: 'postgres',
          url: process.env.DATABASE_URL,
          entities: [Band, Member, Album, Song, User, Role, Event, Country],
          synchronize: isTest, // Enable auto-sync for tests, disable for dev/prod
          logging: !isProduction && !isTest,
          // Log only errors in production
          logger: isProduction ? 'advanced-console' : 'advanced-console',
          // Connection pool configuration
          extra: {
            // Maximum number of clients in the pool
            // Production: 20-50 depending on load, Development: 10
            max: Number(process.env.DB_POOL_MAX) || (isProduction ? 30 : 10),

            // Minimum number of clients in the pool
            // Keep connections warm for faster queries
            min: Number(process.env.DB_POOL_MIN) || (isProduction ? 5 : 2),

            // Close idle clients after 30 seconds (production) or 10 seconds (dev)
            idleTimeoutMillis: Number(process.env.DB_POOL_IDLE) ||
              (isProduction ? 30000 : 10000),

            // Return an error after 10 seconds if connection cannot be established
            connectionTimeoutMillis: Number(process.env.DB_POOL_TIMEOUT) || 10000,

            // Number of times to retry connecting
            maxUses: Number(process.env.DB_POOL_MAX_USES) || 7500,

            // Allow idle clients to be closed
            allowExitOnIdle: !isProduction,

            // Enable keep-alive to detect broken connections
            keepAlive: true,
            keepAliveInitialDelayMillis: 10000,

            // Query timeout (30 seconds)
            statement_timeout: Number(process.env.DB_STATEMENT_TIMEOUT) || 30000,

            // Application name for easier monitoring in pg_stat_activity
            application_name: process.env.DB_APP_NAME || 'mbands-api',

            // SSL configuration for production
            ...(isProduction && process.env.DB_SSL === 'true'
              ? {
                ssl: {
                  rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false',
                  ca: process.env.DB_SSL_CA,
                  key: process.env.DB_SSL_KEY,
                  cert: process.env.DB_SSL_CERT,
                },
              }
              : {}),
          },
          // Retry connection attempts
          retryAttempts: Number(process.env.DB_RETRY_ATTEMPTS) || 10,
          retryDelay: Number(process.env.DB_RETRY_DELAY) || 3000,
          // Auto-load entities
          autoLoadEntities: true,
          // Connection pool eviction
          maxQueryExecutionTime: isProduction
            ? Number(process.env.DB_MAX_QUERY_TIME) || 5000
            : 10000,
        };
      },
    }),
    HealthModule,
    BandsModule,
    MembersModule,
    AlbumsModule,
    SongsModule,
    AuthModule,
    UsersModule,
    EventsModule,
    CountriesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule { }
