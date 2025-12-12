import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import * as Joi from 'joi';
import { HealthModule } from './health/health.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Band } from './bands/entities/band.entity';
import { Member } from './members/entities/member.entity';
import { Album } from './albums/entities/album.entity';
import { Song } from './songs/entities/song.entity';
import { User } from './users/entities/user.entity';
import { Role } from './users/entities/role.entity';
import { Event } from './events/entities/event.entity';
import { Country } from './countries/entities/country.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BandsModule } from './bands/bands.module';
import { MembersModule } from './members/members.module';
import { AlbumsModule } from './albums/albums.module';
import { Band } from './bands/entities/band.entity';
import { Member } from './members/entities/member.entity';
import { Album } from './albums/entities/album.entity';
import { SongsModule } from './songs/songs.module';
import { Song } from './songs/entities/song.entity';
import { AuthModule } from './auth/auth.module';
import { User } from './users/entities/user.entity';
import { UsersModule } from './users/users.module';
import { EventsModule } from './events/events.module';
import { Event } from './events/entities/event.entity';
import { Role } from './users/entities/role.entity';
import { CountriesModule } from './countries/countries.module';
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
        ttl: 60,
        limit: 100,
      },
    ]),
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'postgres',
        url: process.env.DATABASE_URL,
        entities: [Band, Member, Album, Song, User, Role, Event, Country],
        synchronize: false,
        logging: process.env.NODE_ENV !== 'production',
      }),
    }),
    HealthModule,
  ],
  controllers: [],
  providers: [],
})
        ttl: 60000, // 1 minute
        limit: 100, // max 100 requests per minute (global default)
      },
    ]),
    TypeOrmModule.forRoot({
      type: process.env.DB_TYPE as any,
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT ?? '5432', 10),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [Band, Member, Album, Song, User, Event, Role, Country],
      synchronize: process.env.NODE_ENV !== 'production',
      extra: {
        max: Number(process.env.DB_POOL_MAX) || 10,
        min: Number(process.env.DB_POOL_MIN) || 2,
        idleTimeoutMillis: Number(process.env.DB_POOL_IDLE) || 30000,
        connectionTimeoutMillis: Number(process.env.DB_POOL_TIMEOUT) || 5000,
      },
    }),
    TypeOrmModule.forFeature(),
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
export class AppModule {}
