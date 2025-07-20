import { Band } from '../../bands/entities/band.entity';
import { Song } from '../../songs/entities/song.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ManyToMany,
  JoinTable,
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
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'date', nullable: true })
  releaseDate: Date;

  @Column({ length: 100, nullable: true })
  genre: string;

  @Column({ length: 255, nullable: true })
  label: string;

  @Column({ length: 255, nullable: true })
  producer: string;

  @Column({ nullable: true, length: 500 })
  website: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true, length: 500 })
  coverImageUrl: string;

  @Column({ type: 'int', nullable: true })
  totalTracks: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;

  @ManyToOne(() => Band, (band) => band.albums, {
    onDelete: 'CASCADE',
    nullable: false
  })
  @JoinColumn({ name: 'band_id' })
  band: Band;

  @ManyToMany(() => Song, (song) => song.albums)
  songs: Song[];
}
