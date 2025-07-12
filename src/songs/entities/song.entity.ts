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
} from 'typeorm';

@Entity()
export class Song {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

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