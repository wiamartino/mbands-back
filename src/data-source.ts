import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';

import { Band } from './bands/entities/band.entity';
import { Member } from './members/entities/member.entity';
import { Album } from './albums/entities/album.entity';
import { Song } from './songs/entities/song.entity';
import { User } from './users/entities/user.entity';
import { Role } from './users/entities/role.entity';
import { Event } from './events/entities/event.entity';
import { Country } from './countries/entities/country.entity';

config();

const configService = new ConfigService();

const databaseUrl = configService.get<string>('DATABASE_URL');

export default new DataSource({
  type: 'postgres',
  url: databaseUrl,
  host: databaseUrl ? undefined : configService.get('DB_HOST') || 'localhost',
  port: databaseUrl ? undefined : Number(configService.get('DB_PORT')) || 5432,
  username: databaseUrl
    ? undefined
    : configService.get('DB_USERNAME') || 'postgres',
  password: databaseUrl
    ? undefined
    : configService.get('DB_PASSWORD') || 'password',
  database: databaseUrl ? undefined : configService.get('DB_NAME') || 'mbands',
  entities: [Band, Member, Album, Song, User, Role, Event, Country],
  migrations: ['src/migrations/**/*{.ts,.js}'],
  synchronize: false,
  logging: process.env.NODE_ENV !== 'production',
});
