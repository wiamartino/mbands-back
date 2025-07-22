import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
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
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { User } from './users/entities/user.entity';
import { UsersModule } from './users/users.module';
import { EventsModule } from './events/events.module';
import { Event } from './events/entities/event.entity';
import {Role } from './users/entities/role.entity';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: process.env.DB_TYPE as any,
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [Band, Member, Album, Song, User, Event, Role],
      synchronize: process.env.NODE_ENV !== 'production',
    }),
    TypeOrmModule.forFeature(),
    BandsModule,
    MembersModule,
    AlbumsModule,
    SongsModule,
    AuthModule,
    UsersModule,
    EventsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
