import { Album } from '../../albums/entities/album.entity';
import { Member } from '../../members/entities/member.entity';
import { Event } from '../../events/entities/event.entity';
import { Song } from '../../songs/entities/song.entity';
import { Country } from '../../countries/entities/country.entity';
import { ApiProperty } from '@nestjs/swagger';
import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  OneToMany, 
  ManyToOne,
  JoinColumn,
  CreateDateColumn, 
  UpdateDateColumn, 
  DeleteDateColumn,
  Index
} from 'typeorm';

@Entity()
@Index(['genre'])
@Index(['yearFormed'])
@Index(['active'])
export class Band {
  @ApiProperty({
    description: 'Unique identifier for the band',
    example: 1,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: 'Name of the band',
    example: 'The Beatles',
    maxLength: 255,
  })
  @Column({ length: 255, unique: true })
  name: string;

  @ApiProperty({
    description: 'Musical genre of the band',
    example: 'Rock',
    maxLength: 100,
  })
  @Column({ length: 100 })
  genre: string;

  @ApiProperty({
    description: 'Year the band was formed (must be between 1900 and current year)',
    example: 1960,
    minimum: 1900,
  })
  @Column({ type: 'int', comment: 'Year the band was formed (must be between 1900 and current year)' })
  yearFormed: number;

  @ApiProperty({
    description: 'Whether the band is currently active',
    example: true,
    default: true,
  })
  @Column({ default: true })
  active: boolean;

  @ApiProperty({
    description: 'Official website URL',
    example: 'https://www.thebeatles.com',
    maxLength: 500,
    required: false,
  })
  @Column({ nullable: true, length: 500 })
  website: string;

  @ApiProperty({
    description: 'Detailed description of the band',
    example: 'English rock band formed in Liverpool in 1960',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  description: string;

  @ApiProperty({
    description: 'URL to the band image',
    example: 'https://example.com/bands/the-beatles.jpg',
    maxLength: 500,
    required: false,
  })
  @Column({ nullable: true, length: 500 })
  imageUrl: string;

  @ApiProperty({
    description: 'Date when the band record was created',
    example: '2023-01-01T00:00:00.000Z',
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    description: 'Date when the band record was last updated',
    example: '2023-01-01T00:00:00.000Z',
  })
  @UpdateDateColumn()
  updatedAt: Date;

  @ApiProperty({
    description: 'Date when the band record was soft deleted',
    example: '2023-01-01T00:00:00.000Z',
    required: false,
  })
  @DeleteDateColumn()
  deletedAt?: Date;

  @ApiProperty({
    description: 'Country where the band originates from',
    type: () => Country,
  })
  @ManyToOne(() => Country, (country) => country.bands, { 
    onDelete: 'CASCADE',
    nullable: false 
  })
  @JoinColumn({ name: 'country_id' })
  country: Country;

  @ApiProperty({
    description: 'Band members',
    type: () => [Member],
  })
  @OneToMany(() => Member, (member) => member.band, { cascade: true })
  members: Member[];

  @ApiProperty({
    description: 'Albums released by the band',
    type: () => [Album],
  })
  @OneToMany(() => Album, (album) => album.band, { cascade: true })
  albums: Album[];

  @ApiProperty({
    description: 'Songs created by the band',
    type: () => [Song],
  })
  @OneToMany(() => Song, (song) => song.band, { cascade: true })
  songs: Song[];

  @ApiProperty({
    description: 'Events associated with the band',
    type: () => [Event],
  })
  @OneToMany(() => Event, (event) => event.band, { cascade: true })
  events: Event[];
}