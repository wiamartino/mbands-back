import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Band } from '../bands/entities/band.entity';
import { Member } from '../members/entities/member.entity';
import { Album } from '../albums/entities/album.entity';
import { Song } from '../songs/entities/song.entity';
import { User } from '../users/entities/user.entity';
import { Role } from '../users/entities/role.entity';
import { Event } from '../events/entities/event.entity';
import * as bcrypt from 'bcrypt';

async function seed() {
  const app = await NestFactory.create(AppModule);
  const bandRepo = app.get<Repository<Band>>(getRepositoryToken(Band));
  const memberRepo = app.get<Repository<Member>>(getRepositoryToken(Member));
  const albumRepo = app.get<Repository<Album>>(getRepositoryToken(Album));
  const songRepo = app.get<Repository<Song>>(getRepositoryToken(Song));
  const userRepo = app.get<Repository<User>>(getRepositoryToken(User));
  const roleRepo = app.get<Repository<Role>>(getRepositoryToken(Role));
  const eventRepo = app.get<Repository<Event>>(getRepositoryToken(Event));

  console.log('Starting database seeding...');

  // Create roles
  const adminRole = roleRepo.create({ 
    name: 'Admin',
    description: 'Full system access'
  });
  await roleRepo.save(adminRole);

  const userRole = roleRepo.create({ 
    name: 'User',
    description: 'Standard user access'
  });
  await roleRepo.save(userRole);

  // Create bands with enhanced data
  const metallica = bandRepo.create({ 
    name: 'Metallica', 
    genre: 'Heavy Metal', 
    yearFormed: 1981, 
    country: 'USA', 
    active: true, 
    website: 'https://www.metallica.com',
    description: 'American heavy metal band formed in Los Angeles.',
    imageUrl: 'https://example.com/metallica.jpg'
  });
  await bandRepo.save(metallica);

  const pinkFloyd = bandRepo.create({ 
    name: 'Pink Floyd', 
    genre: 'Progressive Rock', 
    yearFormed: 1965, 
    country: 'UK', 
    active: false, 
    website: 'https://www.pinkfloyd.com',
    description: 'English rock band formed in London.',
    imageUrl: 'https://example.com/pinkfloyd.jpg'
  });
  await bandRepo.save(pinkFloyd);

  // Create members with enhanced data
  const jamesHetfield = memberRepo.create({ 
    name: 'James Hetfield', 
    instrument: 'Vocals', 
    band: metallica,
    joinDate: new Date('1981-10-28'),
    isActive: true,
    biography: 'Co-founder, lead vocalist, rhythm guitarist, and primary songwriter for Metallica.'
  });
  await memberRepo.save(jamesHetfield);

  const larsUlrich = memberRepo.create({ 
    name: 'Lars Ulrich', 
    instrument: 'Drums', 
    band: metallica,
    joinDate: new Date('1981-10-28'),
    isActive: true,
    biography: 'Danish musician and co-founder of Metallica.'
  });
  await memberRepo.save(larsUlrich);

  const davidGilmour = memberRepo.create({ 
    name: 'David Gilmour', 
    instrument: 'Guitar', 
    band: pinkFloyd,
    joinDate: new Date('1968-02-01'),
    leaveDate: new Date('2014-07-07'),
    isActive: false,
    biography: 'English guitarist, singer, and songwriter, best known as a member of Pink Floyd.'
  });
  await memberRepo.save(davidGilmour);

  // Create albums with enhanced data
  const masterOfPuppets = albumRepo.create({ 
    name: 'Master of Puppets', 
    genre: 'Heavy Metal', 
    band: metallica,
    releaseDate: new Date('1986-03-03'),
    label: 'Elektra Records',
    producer: 'Flemming Rasmussen',
    description: 'The third studio album by American heavy metal band Metallica.',
    coverImageUrl: 'https://example.com/master-of-puppets.jpg',
    totalTracks: 8
  });
  await albumRepo.save(masterOfPuppets);

  const darkSideOfTheMoon = albumRepo.create({ 
    name: 'The Dark Side of the Moon', 
    genre: 'Progressive Rock', 
    band: pinkFloyd,
    releaseDate: new Date('1973-03-01'),
    label: 'Harvest Records',
    producer: 'Pink Floyd',
    description: 'The eighth studio album by the English rock band Pink Floyd.',
    coverImageUrl: 'https://example.com/dark-side-of-the-moon.jpg',
    totalTracks: 10
  });
  await albumRepo.save(darkSideOfTheMoon);

  // Create songs with enhanced data
  const masterOfPuppetsSong = songRepo.create({ 
    title: 'Master of Puppets', 
    band: metallica,
    duration: 516, // 8:36 in seconds
    trackNumber: 1,
    lyrics: 'Master of puppets I\'m pulling your strings...',
    videoUrl: 'https://youtube.com/watch?v=example'
  });
  await songRepo.save(masterOfPuppetsSong);

  const money = songRepo.create({ 
    title: 'Money', 
    band: pinkFloyd,
    duration: 382, // 6:22 in seconds
    trackNumber: 6,
    lyrics: 'Money, it\'s a gas...',
    videoUrl: 'https://youtube.com/watch?v=example2'
  });
  await songRepo.save(money);

  // Associate songs with albums
  masterOfPuppets.songs = [masterOfPuppetsSong];
  await albumRepo.save(masterOfPuppets);

  darkSideOfTheMoon.songs = [money];
  await albumRepo.save(darkSideOfTheMoon);

  // Create events with enhanced data
  const metallicaConcert = eventRepo.create({
    title: 'Metallica World Tour 2024',
    description: 'An epic heavy metal concert featuring Metallica\'s greatest hits.',
    date: new Date('2024-12-15T20:00:00Z'),
    band: metallica,
    eventType: 'Concert',
    venue: 'Madison Square Garden',
    city: 'New York',
    country: 'USA',
    ticketPrice: 150.00,
    ticketUrl: 'https://tickets.example.com/metallica',
    isActive: true
  });
  await eventRepo.save(metallicaConcert);

  // Create users with enhanced data
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const adminUser = userRepo.create({ 
    username: 'admin', 
    password: hashedPassword, 
    email: 'admin@mbands.com',
    firstName: 'Admin',
    lastName: 'User',
    isActive: true,
    roles: [adminRole] 
  });
  await userRepo.save(adminUser);

  const regularUser = userRepo.create({ 
    username: 'john_doe', 
    password: hashedPassword, 
    email: 'john@example.com',
    firstName: 'John',
    lastName: 'Doe',
    isActive: true,
    roles: [userRole] 
  });
  await userRepo.save(regularUser);

  console.log('Database seeded successfully with enhanced data!');
  console.log('Created:');
  console.log('- 2 Roles (Admin, User)');
  console.log('- 2 Bands (Metallica, Pink Floyd)');
  console.log('- 3 Members');
  console.log('- 2 Albums');
  console.log('- 2 Songs');
  console.log('- 1 Event');
  console.log('- 2 Users');

  await app.close();
}

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});