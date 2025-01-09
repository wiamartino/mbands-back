import { Album } from '../../albums/entities/album.entity';
import { Band } from '../../bands/entities/band.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  ManyToMany,
} from 'typeorm';

@Entity()
export class Song {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @ManyToOne(() => Band)
  band: Band;

  @ManyToMany(() => Album)
  albums: Album[];
}
