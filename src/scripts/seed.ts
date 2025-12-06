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
import { Country } from '../countries/entities/country.entity';
import { countries } from './countries';
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
  const countryRepo = app.get<Repository<Country>>(getRepositoryToken(Country));

  console.log('Starting database seeding...');

  // Create roles
  const adminRoleExists = await roleRepo.findOne({ where: { name: 'Admin' } });
  let adminRole = adminRoleExists;
  if (!adminRole) {
    adminRole = roleRepo.create({
      name: 'Admin',
      description: 'Full system access'
    });
    await roleRepo.save(adminRole);
  }

  const userRoleExists = await roleRepo.findOne({ where: { name: 'User' } });
  let userRole = userRoleExists;
  if (!userRole) {
    userRole = roleRepo.create({
      name: 'User',
      description: 'Standard user access'
    });
    await roleRepo.save(userRole);
  }

  // Create countries
  console.log('Creating countries...');

  for (const countryData of countries) {
    const existing = await countryRepo.findOne({
      where: [
        { code: countryData.code },
        { name: countryData.name }
      ]
    });

    if (!existing) {
      await countryRepo.save(countryRepo.create(countryData));
    }
  }

  // Retrieve countries needed for relationships
  const usa = await countryRepo.findOneByOrFail({ code: 'USA' });
  const uk = await countryRepo.findOneByOrFail({ code: 'GBR' });
  const germany = await countryRepo.findOneByOrFail({ code: 'DEU' });
  const canada = await countryRepo.findOneByOrFail({ code: 'CAN' });
  const sweden = await countryRepo.findOneByOrFail({ code: 'SWE' });
  const australia = await countryRepo.findOneByOrFail({ code: 'AUS' });

  // Create bands with enhanced data
  console.log('Creating bands...');

  let metallica = await bandRepo.findOne({ where: { name: 'Metallica' } });
  if (!metallica) {
    metallica = bandRepo.create({
      name: 'Metallica',
      genre: 'Heavy Metal',
      yearFormed: 1981,
      country: usa,
      active: true,
      website: 'https://www.metallica.com',
      description: 'American heavy metal band formed in Los Angeles.',
      imageUrl: 'https://example.com/metallica.jpg'
    });
    await bandRepo.save(metallica);
  }

  let pinkFloyd = await bandRepo.findOne({ where: { name: 'Pink Floyd' } });
  if (!pinkFloyd) {
    pinkFloyd = bandRepo.create({
      name: 'Pink Floyd',
      genre: 'Progressive Rock',
      yearFormed: 1965,
      country: uk,
      active: false,
      website: 'https://www.pinkfloyd.com',
      description: 'English rock band formed in London.',
      imageUrl: 'https://example.com/pinkfloyd.jpg'
    });
    await bandRepo.save(pinkFloyd);
  }

  let abba = await bandRepo.findOne({ where: { name: 'ABBA' } });
  if (!abba) {
    abba = bandRepo.create({
      name: 'ABBA',
      genre: 'Pop',
      yearFormed: 1972,
      country: sweden,
      active: false,
      website: 'https://www.abbasite.com',
      description: 'Swedish pop supergroup formed in Stockholm.',
      imageUrl: 'https://example.com/abba.jpg'
    });
    await bandRepo.save(abba);
  }

  let acdc = await bandRepo.findOne({ where: { name: 'AC/DC' } });
  if (!acdc) {
    acdc = bandRepo.create({
      name: 'AC/DC',
      genre: 'Hard Rock',
      yearFormed: 1973,
      country: australia,
      active: true,
      website: 'https://www.acdc.com',
      description: 'Australian rock band formed in Sydney.',
      imageUrl: 'https://example.com/acdc.jpg'
    });
    await bandRepo.save(acdc);
  }

  let rush = await bandRepo.findOne({ where: { name: 'Rush' } });
  if (!rush) {
    rush = bandRepo.create({
      name: 'Rush',
      genre: 'Progressive Rock',
      yearFormed: 1968,
      country: canada,
      active: false,
      website: 'https://www.rush.com',
      description: 'Canadian rock band formed in Toronto.',
      imageUrl: 'https://example.com/rush.jpg'
    });
    await bandRepo.save(rush);
  }

  // Create members with enhanced data
  let jamesHetfield = await memberRepo.findOne({ where: { name: 'James Hetfield' } });
  if (!jamesHetfield) {
    jamesHetfield = memberRepo.create({
      name: 'James Hetfield',
      instrument: 'Vocals',
      band: metallica,
      joinDate: new Date('1981-10-28'),
      isActive: true,
      biography: 'Co-founder, lead vocalist, rhythm guitarist, and primary songwriter for Metallica.'
    });
    await memberRepo.save(jamesHetfield);
  }

  let larsUlrich = await memberRepo.findOne({ where: { name: 'Lars Ulrich' } });
  if (!larsUlrich) {
    larsUlrich = memberRepo.create({
      name: 'Lars Ulrich',
      instrument: 'Drums',
      band: metallica,
      joinDate: new Date('1981-10-28'),
      isActive: true,
      biography: 'Danish musician and co-founder of Metallica.'
    });
    await memberRepo.save(larsUlrich);
  }

  let davidGilmour = await memberRepo.findOne({ where: { name: 'David Gilmour' } });
  if (!davidGilmour) {
    davidGilmour = memberRepo.create({
      name: 'David Gilmour',
      instrument: 'Guitar',
      band: pinkFloyd,
      joinDate: new Date('1968-02-01'),
      leaveDate: new Date('2014-07-07'),
      isActive: false,
      biography: 'English guitarist, singer, and songwriter, best known as a member of Pink Floyd.'
    });
    await memberRepo.save(davidGilmour);
  }

  let bjornUlvaeus = await memberRepo.findOne({ where: { name: 'Björn Ulvaeus' } });
  if (!bjornUlvaeus) {
    bjornUlvaeus = memberRepo.create({
      name: 'Björn Ulvaeus',
      instrument: 'Guitar',
      band: abba,
      joinDate: new Date('1972-01-01'),
      leaveDate: new Date('1982-12-11'),
      isActive: false,
      biography: 'Swedish songwriter, composer, musician, writer, and producer.'
    });
    await memberRepo.save(bjornUlvaeus);
  }

  let angusYoung = await memberRepo.findOne({ where: { name: 'Angus Young' } });
  if (!angusYoung) {
    angusYoung = memberRepo.create({
      name: 'Angus Young',
      instrument: 'Guitar',
      band: acdc,
      joinDate: new Date('1973-12-01'),
      isActive: true,
      biography: 'Scottish-Australian guitarist and co-founder of AC/DC.'
    });
    await memberRepo.save(angusYoung);
  }

  let geddyLee = await memberRepo.findOne({ where: { name: 'Geddy Lee' } });
  if (!geddyLee) {
    geddyLee = memberRepo.create({
      name: 'Geddy Lee',
      instrument: 'Vocals',
      band: rush,
      joinDate: new Date('1968-09-01'),
      leaveDate: new Date('2018-01-01'),
      isActive: false,
      biography: 'Canadian musician, singer, and songwriter, best known as the lead vocalist, bassist, and keyboardist for Rush.'
    });
    await memberRepo.save(geddyLee);
  }

  // Create albums with enhanced data
  let masterOfPuppets = await albumRepo.findOne({ where: { name: 'Master of Puppets' } });
  if (!masterOfPuppets) {
    masterOfPuppets = albumRepo.create({
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
  }

  let darkSideOfTheMoon = await albumRepo.findOne({ where: { name: 'The Dark Side of the Moon' } });
  if (!darkSideOfTheMoon) {
    darkSideOfTheMoon = albumRepo.create({
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
  }

  // Create songs with enhanced data
  let masterOfPuppetsSong = await songRepo.findOne({ where: { title: 'Master of Puppets', band: { id: metallica.id } } });
  if (!masterOfPuppetsSong) {
    masterOfPuppetsSong = songRepo.create({
      title: 'Master of Puppets',
      band: metallica,
      duration: 516, // 8:36 in seconds
      trackNumber: 1,
      lyrics: 'Master of puppets I\'m pulling your strings...',
      videoUrl: 'https://youtube.com/watch?v=example'
    });
    await songRepo.save(masterOfPuppetsSong);
  }

  let money = await songRepo.findOne({ where: { title: 'Money', band: { id: pinkFloyd.id } } });
  if (!money) {
    money = songRepo.create({
      title: 'Money',
      band: pinkFloyd,
      duration: 382, // 6:22 in seconds
      trackNumber: 6,
      lyrics: 'Money, it\'s a gas...',
      videoUrl: 'https://youtube.com/watch?v=example2'
    });
    await songRepo.save(money);
  }

  // Associate songs with albums
  if (masterOfPuppets && masterOfPuppetsSong) {
    if (!masterOfPuppets.songs) masterOfPuppets.songs = [];
    const hasSong = masterOfPuppets.songs.some(s => s.id === masterOfPuppetsSong.id);
    if (!hasSong) {
      masterOfPuppets.songs = [...masterOfPuppets.songs, masterOfPuppetsSong];
      await albumRepo.save(masterOfPuppets);
    }
  }

  if (darkSideOfTheMoon && money) {
    if (!darkSideOfTheMoon.songs) darkSideOfTheMoon.songs = [];
    const hasSong = darkSideOfTheMoon.songs.some(s => s.id === money.id);
    if (!hasSong) {
      darkSideOfTheMoon.songs = [...darkSideOfTheMoon.songs, money];
      await albumRepo.save(darkSideOfTheMoon);
    }
  }

  // Create events with enhanced data
  let metallicaConcert = await eventRepo.findOne({ where: { title: 'Metallica World Tour 2024' } });
  if (!metallicaConcert) {
    metallicaConcert = eventRepo.create({
      title: 'Metallica World Tour 2024',
      description: 'An epic heavy metal concert featuring Metallica\'s greatest hits.',
      date: new Date('2024-12-15T20:00:00Z'),
      band: metallica,
      eventType: 'Concert',
      venue: 'Madison Square Garden',
      city: 'New York',
      country: usa,
      ticketPrice: 150.00,
      ticketUrl: 'https://tickets.example.com/metallica',
      isActive: true
    });
    await eventRepo.save(metallicaConcert);
  }

  // Create users with enhanced data
  const hashedPassword = await bcrypt.hash('password123', 10);

  let adminUser = await userRepo.findOne({ where: { username: 'admin' } });
  if (!adminUser) {
    adminUser = userRepo.create({
      username: 'admin',
      password: hashedPassword,
      email: 'admin@mbands.com',
      firstName: 'Admin',
      lastName: 'User',
      isActive: true,
      roles: [adminRole]
    });
    await userRepo.save(adminUser);
  }

  let regularUser = await userRepo.findOne({ where: { username: 'john_doe' } });
  if (!regularUser) {
    regularUser = userRepo.create({
      username: 'john_doe',
      password: hashedPassword,
      email: 'john@example.com',
      firstName: 'John',
      lastName: 'Doe',
      isActive: true,
      roles: [userRole]
    });
    await userRepo.save(regularUser);
  }

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