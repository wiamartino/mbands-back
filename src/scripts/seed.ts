import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Band } from '../bands/entities/band.entity';
import { Member } from '../members/entities/member.entity';
import { Album } from '../albums/entities/album.entity';
import { Song } from '../songs/entities/song.entity';
import { User } from '../users/entities/user.entity';

async function seed() {
  const app = await NestFactory.create(AppModule);
  const bandRepo = app.get<Repository<Band>>(getRepositoryToken(Band));
  const memberRepo = app.get<Repository<Member>>(getRepositoryToken(Member));
  const albumRepo = app.get<Repository<Album>>(getRepositoryToken(Album));
  const songRepo = app.get<Repository<Song>>(getRepositoryToken(Song));
  const userRepo = app.get<Repository<User>>(getRepositoryToken(User));

  const band = bandRepo.create({ name: 'Seed Band', genre: 'Rock', yearFormed: 2021, country: 'USA', active: true, website: 'http://example.com' });
  await bandRepo.save(band);
  
  const member = memberRepo.create({ name: 'Seed Member', instrument: 'Guitar', band });
  await memberRepo.save(member);

  const album = albumRepo.create({ name: 'Seed Album', genre: 'Rock', band });
  await albumRepo.save(album);

  const song = songRepo.create({ title: 'Seed Song', band });
  await songRepo.save(song);

  const role = roleRepo.create({ name: 'Admin' });
  await roleRepo.save(role);

  const user = userRepo.create({ username: 'seeduser', password: 'hashedpassword', email: 'seed@example.com', roles: [role] });
  await userRepo.save(user);

  console.log('Database seeded successfully');
  await app.close();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});