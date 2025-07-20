import { Album } from '../../albums/entities/album.entity';
import { Band } from '../../bands/entities/band.entity';
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
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'int', nullable: true, comment: 'Duration in seconds' })
  duration: number;

  @Column({ type: 'int', nullable: true })
  trackNumber: number;

  @Column({ type: 'text', nullable: true })
  lyrics: string;

  @Column({ nullable: true, length: 500 })
  videoUrl: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;

  @ManyToOne(() => Band, (band) => band.songs, { 
    onDelete: 'CASCADE',
    nullable: false 
  })
  @JoinColumn({ name: 'band_id' })
  band: Band;

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