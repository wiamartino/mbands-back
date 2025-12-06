import { Album } from '../../albums/entities/album.entity';
import { Band } from '../../bands/entities/band.entity';
import { ApiProperty } from '@nestjs/swagger';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  ManyToMany,
  JoinColumn,
  JoinTable,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
} from 'typeorm';

@Entity()
@Index(['title'])
export class Song {
  @ApiProperty({
    description: 'Unique identifier for the song',
    example: 1,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: 'Title of the song',
    example: 'Hey Jude',
    maxLength: 255,
  })
  @Column({ length: 255 })
  title: string;

  @ApiProperty({
    description: 'Duration of the song in seconds',
    example: 431,
    required: false,
  })
  @Column({ type: 'int', nullable: true, comment: 'Duration in seconds' })
  duration: number;

  @ApiProperty({
    description: 'Track number on the album',
    example: 7,
    required: false,
  })
  @Column({ type: 'int', nullable: true })
  trackNumber: number;

  @ApiProperty({
    description: 'Lyrics of the song',
    example: "Hey Jude, don't make it bad...",
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  lyrics: string;

  @ApiProperty({
    description: 'URL to the music video',
    example: 'https://youtube.com/watch?v=A_MjCqQoLLA',
    maxLength: 500,
    required: false,
  })
  @Column({ nullable: true, length: 500 })
  videoUrl: string;

  @ApiProperty({
    description: 'Date when the song record was created',
    example: '2023-01-01T00:00:00.000Z',
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    description: 'Date when the song record was last updated',
    example: '2023-01-01T00:00:00.000Z',
  })
  @UpdateDateColumn()
  updatedAt: Date;

  @ApiProperty({
    description: 'Date when the song record was soft deleted',
    example: '2023-01-01T00:00:00.000Z',
    required: false,
  })
  @DeleteDateColumn()
  deletedAt?: Date;

  @ApiProperty({
    description: 'The band that created this song',
    type: () => Band,
  })
  @ManyToOne(() => Band, (band) => band.songs, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'band_id' })
  band: Band;

  @ApiProperty({
    description: 'Albums that include this song',
    type: () => [Album],
  })
  @ManyToMany(() => Album, (album) => album.songs)
  @JoinTable({
    name: 'song_albums',
    joinColumn: {
      name: 'song_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'album_id',
      referencedColumnName: 'id',
    },
  })
  albums: Album[];
}
