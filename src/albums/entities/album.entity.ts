import { Band } from '../../bands/entities/band.entity';
import { Song } from '../../songs/entities/song.entity';
import { ApiProperty } from '@nestjs/swagger';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ManyToMany,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  JoinColumn,
  Index,
} from 'typeorm';

@Entity()
@Index(['releaseDate'])
@Index(['genre'])
export class Album {
  @ApiProperty({
    description: 'Unique identifier for the album',
    example: 1,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 1 })
  version: number;

  @ApiProperty({
    description: 'Name of the album',
    example: 'Abbey Road',
    maxLength: 255,
  })
  @Column({ length: 255 })
  name: string;

  @ApiProperty({
    description: 'Release date of the album',
    example: '1969-09-26',
    required: false,
  })
  @Column({ type: 'date', nullable: true })
  releaseDate: Date;

  @ApiProperty({
    description: 'Genre of the album',
    example: 'Rock',
    maxLength: 100,
    required: false,
  })
  @Column({ length: 100, nullable: true })
  genre: string;

  @ApiProperty({
    description: 'Record label',
    example: 'Apple Records',
    maxLength: 255,
    required: false,
  })
  @Column({ length: 255, nullable: true })
  label: string;

  @ApiProperty({
    description: 'Producer of the album',
    example: 'George Martin',
    maxLength: 255,
    required: false,
  })
  @Column({ length: 255, nullable: true })
  producer: string;

  @ApiProperty({
    description: 'Official website URL',
    example: 'https://www.thebeatles.com/album/abbey-road',
    maxLength: 500,
    required: false,
  })
  @Column({ nullable: true, length: 500 })
  website: string;

  @ApiProperty({
    description: 'Detailed description of the album',
    example: 'The eleventh studio album by the English rock band the Beatles',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  description: string;

  @ApiProperty({
    description: 'URL to the album cover image',
    example: 'https://example.com/covers/abbey-road.jpg',
    maxLength: 500,
    required: false,
  })
  @Column({ nullable: true, length: 500 })
  coverImageUrl: string;

  @ApiProperty({
    description: 'Total number of tracks in the album',
    example: 17,
    required: false,
  })
  @Column({ type: 'int', nullable: true })
  totalTracks: number;

  @ApiProperty({
    description: 'Date when the album record was created',
    example: '2023-01-01T00:00:00.000Z',
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    description: 'Date when the album record was last updated',
    example: '2023-01-01T00:00:00.000Z',
  })
  @UpdateDateColumn()
  updatedAt: Date;

  @ApiProperty({
    description: 'Date when the album record was soft deleted',
    example: '2023-01-01T00:00:00.000Z',
    required: false,
  })
  @DeleteDateColumn()
  deletedAt?: Date;

  @ApiProperty({
    description: 'The band that created this album',
    type: () => Band,
  })
  @ManyToOne(() => Band, (band) => band.albums, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'band_id' })
  band: Band;

  @ApiProperty({
    description: 'Songs included in this album',
    type: () => [Song],
  })
  @ManyToMany(() => Song, (song) => song.albums)
  songs: Song[];
}
