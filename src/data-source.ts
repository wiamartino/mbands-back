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

config();

const configService = new ConfigService();

export default new DataSource({
  type: 'postgres',
  host: configService.get('DB_HOST') || 'localhost',
  port: configService.get('DB_PORT') || 5432,
  username: configService.get('DB_USERNAME') || 'postgres',
  password: configService.get('DB_PASSWORD') || 'password',
  database: configService.get('DB_NAME') || 'mbands',
  entities: [Band, Member, Album, Song, User, Role, Event],
  migrations: ['src/migrations/**/*{.ts,.js}'],
  synchronize: false, // Set to false for production
  logging: true,
});
